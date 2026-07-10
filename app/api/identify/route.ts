import { NextResponse } from "next/server";
import { normalizeGraded } from "@/lib/graded";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // by-image streams progress then a result (AI path can be slow)
const UPSTREAM_TIMEOUT = 50_000;

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
    if (!res.body) return NextResponse.json({ found: false, error: "No response stream." }, { status: 502 });

    // Re-emit the upstream SSE as our own stream: forward progress messages,
    // and turn the final `result` event into a normalized `done` event.
    const upstream = res.body;
    const stream = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        const send = (o: unknown) => controller.enqueue(enc.encode(`data: ${JSON.stringify(o)}\n\n`));
        const reader = upstream.getReader();
        const dec = new TextDecoder();
        let buf = "";
        let gotResult = false;
        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            let i;
            while ((i = buf.indexOf("\n\n")) >= 0) {
              const block = buf.slice(0, i);
              buf = buf.slice(i + 2);
              const ev = block.match(/event:\s*(\w+)/)?.[1];
              const data = block.match(/data:\s*([\s\S]+)/)?.[1];
              if (!ev || !data) continue;
              if (ev === "progress") {
                try {
                  const d = JSON.parse(data);
                  if (d.message) send({ stage: "progress", message: d.message });
                } catch {}
              } else if (ev === "result") {
                gotResult = true;
                try {
                  const out = normalizeGraded(JSON.parse(data));
                  if (!out.found) out.error = "Couldn't identify a graded card in that image.";
                  send({ stage: "done", result: out });
                } catch {
                  send({ stage: "done", result: { found: false, error: "Couldn't parse the result." } });
                }
              }
            }
          }
          if (!gotResult) send({ stage: "done", result: { found: false, error: "Couldn't identify a graded card — try a clearer, straight-on photo of the slab." } });
        } catch {
          send({ stage: "done", result: { found: false, error: "Photo ID took too long (beta). Use the cert lookup above." } });
        } finally {
          controller.close();
        }
      },
    });
    return new Response(stream, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform" } });
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
