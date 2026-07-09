import { NextResponse } from "next/server";
import { normalizeGraded } from "@/lib/graded";

export const dynamic = "force-dynamic";
export const maxDuration = 25;
const UPSTREAM_TIMEOUT = 12_000; // fail fast with clean JSON instead of a 60s hang → 504

const INDEX = "https://api.renaissos.com";
const MAX = 15 * 1024 * 1024;
const OK = ["image/jpeg", "image/png", "image/webp", "image/avif"];

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
  // Materialize the bytes into a fresh Blob — re-streaming the consumed File
  // through undici can drop the body and make the upstream fetch hang/reset.
  const bytes = await file.arrayBuffer();
  const body = new FormData();
  body.append("file", new Blob([bytes], { type: file.type || "image/jpeg" }), file.name || "card.jpg");
  try {
    const res = await fetch(`${INDEX}/v1/graded/by-image`, {
      method: "POST",
      body,
      headers: key && secret ? { "X-Api-Key": key, "X-Api-Secret": secret } : {},
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT),
    });
    if (res.status === 429)
      return NextResponse.json({ found: false, error: "Photo identify is rate-limited on the public tier (10/day). The cert lookup above is the reliable path." }, { status: 429 });
    if (res.status === 422)
      return NextResponse.json({ found: false, error: "Couldn't read a graded card from that image — try a clearer, straight-on photo of the slab." }, { status: 200 });
    if (!res.ok) return NextResponse.json({ found: false, error: `Index returned ${res.status}.` }, { status: 502 });
    const out = normalizeGraded(await res.json());
    if (!out.found) out.error = "Couldn't identify a graded card in that image.";
    return NextResponse.json(out);
  } catch (e) {
    const timedOut = e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError");
    return NextResponse.json(
      {
        found: false,
        error: timedOut
          ? "Photo ID is slow on the public tier and timed out (beta). Use the cert lookup above — it's instant. A partner API key makes photo ID reliable."
          : "Couldn't reach the photo index. Use the cert lookup above.",
      },
      { status: timedOut ? 200 : 502 },
    );
  }
}
