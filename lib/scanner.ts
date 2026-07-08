// Cross-check logic: Renaiss Ask / Renaiss FMV vs an independent, sale-based
// Renaiss OS Index estimate. Pure + self-checked (`node lib/scanner.ts`).

export type IndexValuation = {
  estimate: number;
  deltaPct: number | null;
  confidence: string | null;
  lastSaleAt: string | null;
  spark: number[];
  population: number | null;
  href: string | null;
};

// `to` is absent on mint/sell events (schema differs by type); keep it optional.
export type Transfer = { txHash: string; to?: string; from?: string; ts: number; type: string };

export type Listing = {
  tokenId: string;
  name: string;
  setName: string;
  grade: string;
  gradingCompany: string;
  cert: string;
  ask: number;
  renaissFmv: number;
  image: string | null;
  transfers: Transfer[];
  index: IndexValuation | null;
  indexError: string | null;
  renaissHref: string;
};

export type Band = "above" | "in-line" | "below" | "unknown";
export type Signals = {
  hasIndex: boolean;
  askVsIndex: number | null; // ask price ÷ independent estimate
  fmvVsIndex: number | null; // Renaiss FMV ÷ independent estimate
  askBand: Band; // buyer view: is the listing over/under the independent estimate
  fmvBand: Band; // credibility view: does Renaiss' FMV track the independent estimate
  askListed: boolean; // false when ask is a placeholder (not genuinely for sale)
};

// >25% over = above, >10% under = below, otherwise in line with the independent estimate.
export function band(ratio: number | null): Band {
  if (ratio == null) return "unknown";
  return ratio >= 1.25 ? "above" : ratio <= 0.9 ? "below" : "in-line";
}

export function listingSignals(l: Listing): Signals {
  const idx = l.index?.estimate ?? null;
  if (!idx || idx <= 0)
    return { hasIndex: false, askVsIndex: null, fmvVsIndex: null, askBand: "unknown", fmvBand: "unknown", askListed: false };
  const askListed = l.ask > 0 && l.ask / idx < 100; // filter $999,999 placeholders
  const askVsIndex = askListed ? l.ask / idx : null;
  const fmvVsIndex = l.renaissFmv / idx;
  return {
    hasIndex: true,
    askVsIndex,
    fmvVsIndex,
    askBand: band(askVsIndex),
    fmvBand: band(fmvVsIndex),
    askListed,
  };
}

// --- self-check ---
function demo() {
  const assert = (c: boolean, m: string) => {
    if (!c) throw new Error("FAIL: " + m);
  };
  const base: Omit<Listing, "ask" | "renaissFmv" | "index"> = {
    tokenId: "1",
    name: "n",
    setName: "s",
    grade: "9",
    gradingCompany: "PSA",
    cert: "PSA1",
    image: null,
    transfers: [],
    indexError: null,
    renaissHref: "",
  };
  const mk = (ask: number, fmv: number, est: number | null): Listing => ({
    ...base,
    ask,
    renaissFmv: fmv,
    index: est == null ? null : { estimate: est, deltaPct: 0, confidence: "low", lastSaleAt: null, spark: [], population: null, href: null },
  });

  assert(listingSignals(mk(100, 40, 50)).askBand === "above", "2× estimate => above");
  assert(listingSignals(mk(45, 40, 50)).askBand === "below", "0.9× estimate => below");
  assert(listingSignals(mk(55, 40, 50)).askBand === "in-line", "1.1× estimate => in-line");
  assert(listingSignals(mk(100, 40, null)).askBand === "unknown", "no index => unknown");
  const s = listingSignals(mk(100, 80, 40));
  assert(s.askVsIndex === 2.5 && s.fmvVsIndex === 2, "ratios computed");
  assert(s.fmvBand === "above", "fmv 2× estimate => above");
  const placeholder = listingSignals(mk(999999, 80, 40));
  assert(!placeholder.askListed && placeholder.askVsIndex === null && placeholder.fmvBand === "above", "placeholder ask ignored, fmv still compared");
  console.log("scanner.ts self-check passed");
}

// @ts-ignore - import.meta.main is available in Node 24+
if (import.meta.main) demo();
