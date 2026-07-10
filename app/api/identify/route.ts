import { NextResponse } from "next/server";
import { normalizeGraded } from "@/lib/graded";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // by-image streams progress then a result (AI path can be slow)
const UPSTREAM_TIMEOUT = 50_000;

const INDEX = "https://api.renaissos.com";
const MAX = 15 * 1024 * 1024;
const OK = ["image/jpeg", "image/png", "image/webp", "image/avif"];

// The endpoint is Server-Sent Events: `event: <name>\ndata: <json>` blocks, ending
// with `event: result`. Pull the result event's JSON out of the buffered stream.
function parseResultEvent(sse: string): unknown | null {
  const lines = sse.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trimStart().startsWith("event: result")) {
      for (let j = i + 1; j < lines.length && j < i + 4; j++) {
        const line = lines[j].trimStart();
        if (line.startsWith("data:")) {
          try {
            return JSON.parse(line.slice(5).trim());
          } catch {
            return null;
          }
        }
      }
    }
  }
  return null;
}

export async function POST(req: Request) {
  let file: FormDataEntryValue | null;
  try {
    file = (await req.formData()).get("file");
  } catch {
    return NextResponse.json({ found: false, error: "Expected a multipart image upload." }, { status: 400 });
  }
  if (!(file instanceof File)) return NextResponse.json({ found: false, error: "No image provided." }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ found: false, error: "Image exceeds 15 MB." }, { status: 400 });
  if (file.type && !OK.includes(file.type))
    return NextResponse.json({ found: false, error: "Use a JPEG, PNG, WebP, or AVIF image." }, { status: 400 });

  const key = process.env.RENAISS_API_KEY;
  const secret = process.env.RENAISS_API_SECRET;
  const bytes = await file.arrayBuffer();
  const body = new FormData();
  body.append("file", new Blob([bytes], { type: file.type || "image/jpeg" }), file.name || "card.jpg");

  try {
    const res = await fetch(`${INDEX}/v1/graded/by-image`, {
      method: "POST",
      body,
      headers: { Accept: "text/event-stream", ...(key && secret ? { "X-Api-Key": key, "X-Api-Secret": secret } : {}) },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT),
    });
    if (res.status === 429)
      return NextResponse.json({ found: false, error: "Photo identify is rate-limited on the public tier (10/day). The cert lookup above is the reliable path." }, { status: 429 });
    if (res.status === 422)
      return NextResponse.json({ found: false, error: "Couldn't read a graded card from that image — try a clearer, straight-on photo of the slab." }, { status: 200 });
    if (!res.ok) return NextResponse.json({ found: false, error: `Index returned ${res.status}.` }, { status: 502 });

    const sse = await res.text();
    const result = parseResultEvent(sse);
    if (!result)
      return NextResponse.json({ found: false, error: "Couldn't identify a graded card in that image — try a clearer, straight-on photo of the slab." }, { status: 200 });
    const out = normalizeGraded(result);
    if (!out.found) out.error = "Couldn't identify a graded card in that image.";
    return NextResponse.json(out);
  } catch (e) {
    const timedOut = e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError");
    return NextResponse.json(
      {
        found: false,
        error: timedOut
          ? "Photo ID took too long (beta). Use the cert lookup above — it's instant."
          : "Couldn't reach the photo index. Use the cert lookup above.",
      },
      { status: timedOut ? 200 : 502 },
    );
  }
}
