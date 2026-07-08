import { NextResponse } from "next/server";
import scanner from "@/data/scanner.json";

export const dynamic = "force-dynamic";

const INDEX = "https://api.renaissos.com";
const mem = new Map<string, unknown>(); // per-lambda cache to spare the rate limit

function fromCache(cert: string) {
  const l = (scanner.listings as { cert: string; index: unknown; name: string; setName: string; grade: string; gradingCompany: string }[]).find(
    (x) => x.cert.toUpperCase() === cert,
  );
  if (!l || !l.index) return null;
  return {
    cert,
    found: true,
    cached: true,
    card: { name: l.name, setName: l.setName, grade: l.grade, gradingCompany: l.gradingCompany, imageUrl: null },
    index: l.index,
  };
}

export async function GET(_req: Request, { params }: { params: Promise<{ cert: string }> }) {
  const raw = (await params).cert || "";
  const cert = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (!/^[A-Z]{2,4}\d{4,}$/.test(cert))
    return NextResponse.json({ error: "Enter a grading cert like PSA12345678." }, { status: 400 });

  if (mem.has(cert)) return NextResponse.json(mem.get(cert));
  // Serve the curated sample from cache first — guarantees the example certs
  // always resolve instantly without spending the 10/day public quota.
  const cached = fromCache(cert);
  if (cached) return NextResponse.json(cached);

  const key = process.env.RENAISS_API_KEY;
  const secret = process.env.RENAISS_API_SECRET;
  try {
    const res = await fetch(`${INDEX}/v1/graded/${cert}`, {
      headers: key && secret ? { "X-Api-Key": key, "X-Api-Secret": secret } : {},
    });
    if (res.status === 429)
      return NextResponse.json(
        { cert, found: false, error: "The independent index is rate-limited right now (10/day). Try one of the example certs below." },
        { status: 429 },
      );
    if (!res.ok) return NextResponse.json({ cert, found: false, error: `Index returned ${res.status}.` }, { status: 502 });
    const j = await res.json();
    if (!j.found || !j.card)
      return NextResponse.json({ cert, found: false, error: "No graded record found for that cert." });
    const c = j.card;
    const out = {
      cert,
      found: true,
      cached: false,
      card: {
        name: c.name,
        setName: c.setName,
        grade: c.gradeLabel ?? c.grade,
        gradingCompany: c.company,
        imageUrl: c.imageUrlThumb ?? c.imageUrl ?? null,
      },
      index: {
        estimate: c.priceUsdCents != null ? c.priceUsdCents / 100 : null,
        deltaPct: c.deltaPct ?? null,
        confidence: c.confidence ?? null,
        lastSaleAt: c.lastSaleAt ?? null,
        spark: (c.spark ?? []).map((v: number) => v / 100),
        population: j.collectible?.rawLookup?.total_population ?? j.collectible?.totalPopulation ?? null,
        href: c.href ? `https://index.renaissos.com${c.href}` : null,
      },
    };
    mem.set(cert, out);
    return NextResponse.json(out);
  } catch {
    return NextResponse.json({ cert, found: false, error: "Could not reach the independent index." }, { status: 502 });
  }
}
