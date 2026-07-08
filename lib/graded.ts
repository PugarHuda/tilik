// Normalizes a Renaiss OS Index graded-lookup payload (used by both the
// cert-lookup and the by-image routes) into the shape the UI expects.
export type GradedResult = {
  cert: string;
  found: boolean;
  cached?: boolean;
  error?: string;
  card?: {
    name: string;
    setName: string;
    grade: string;
    gradingCompany: string;
    imageUrl: string | null;
  };
  index?: {
    estimate: number | null;
    deltaPct: number | null;
    confidence: string | null;
    lastSaleAt: string | null;
    spark: number[];
    population: number | null;
    href: string | null;
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeGraded(j: any, certFallback?: string): GradedResult {
  const cert = j?.cert ?? certFallback ?? "";
  if (!j?.found || !j?.card) return { cert, found: false, error: "No graded record found." };
  const c = j.card;
  return {
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
}
