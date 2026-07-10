// Pure EV / odds engine. No I/O, no framework deps — takes a normalized Pack
// (from data/packs.json) and returns everything the dashboard renders.
// Self-check at the bottom: run `node lib/ev.ts`.

export type Pull = { tokenId: string; tier: string; fmv: number; pulledAt: string };
export type Pack = {
  slug: string;
  name: string;
  packType: string;
  stage: string;
  author: string;
  description: string;
  ripPrice: number;
  officialEV: number;
  featuredCardFmv: number;
  pulls: Pull[];
};

export type TierRow = { tier: string; count: number; share: number; meanFmv: number };
export type Bin = { label: string; count: number; kind: "loss" | "profit" | "chase" };
export type Stats = {
  n: number;
  ripPrice: number;
  officialEV: number;
  featuredCardFmv: number;
  empiricalMean: number;
  meanCiLow: number; // 95% CI for the observed mean (captures small-sample noise)
  meanCiHigh: number;
  median: number;
  min: number;
  max: number;
  evRatioOfficial: number; // Renaiss' stated EV / rip
  evRatioEmpirical: number; // observed mean / rip
  pProfit: number; // share of observed pulls worth more than rip
  claimGap: number; // empiricalMean - officialEV (how far reality sits from the claim)
  tiers: TierRow[];
  histogram: Bin[];
  // "top-heavy": mean is +EV but most single pulls lose — the average is
  // carried by rare chase hits. Kept distinct from "positive" for honesty.
  verdict: "positive" | "top-heavy" | "roughly-fair" | "negative";
};

const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

function median(sorted: number[]): number {
  const n = sorted.length;
  if (n === 0) return 0;
  return n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
}

function tierBreakdown(pulls: Pull[]): TierRow[] {
  const by = new Map<string, number[]>();
  for (const p of pulls) (by.get(p.tier) ?? by.set(p.tier, []).get(p.tier)!).push(p.fmv);
  const n = pulls.length || 1;
  return [...by.entries()]
    .map(([tier, fmvs]) => ({
      tier,
      count: fmvs.length,
      share: fmvs.length / n,
      meanFmv: sum(fmvs) / fmvs.length,
    }))
    .sort((a, b) => b.meanFmv - a.meanFmv); // top tier (highest value) first
}

// Value bins relative to rip price: floor/loss at the left, chase at the right.
const BINS: { label: string; lo: number; hi: number; kind: Bin["kind"] }[] = [
  { label: "<0.25×", lo: 0, hi: 0.25, kind: "loss" },
  { label: "0.25–0.5×", lo: 0.25, hi: 0.5, kind: "loss" },
  { label: "0.5–1×", lo: 0.5, hi: 1, kind: "loss" },
  { label: "1–2×", lo: 1, hi: 2, kind: "profit" },
  { label: "2–5×", lo: 2, hi: 5, kind: "chase" },
  { label: "5×+", lo: 5, hi: Infinity, kind: "chase" },
];

function histogram(fmvs: number[], rip: number): Bin[] {
  return BINS.map((b) => ({
    label: b.label,
    kind: b.kind,
    count: fmvs.filter((v) => v / rip >= b.lo && v / rip < b.hi).length,
  }));
}

export function packStats(pack: Pack): Stats {
  const rip = pack.ripPrice;
  const fmvs = pack.pulls.map((p) => p.fmv).sort((a, b) => a - b);
  const n = fmvs.length;
  const mean = n ? sum(fmvs) / n : 0;
  // 95% CI for the mean — the pull sample is small (~30), so show the noise.
  const variance = n > 1 ? fmvs.reduce((a, v) => a + (v - mean) ** 2, 0) / (n - 1) : 0;
  const stdErr = n > 0 ? Math.sqrt(variance) / Math.sqrt(n) : 0;
  const evRatioEmpirical = rip ? mean / rip : 0;
  const pProfit = n ? fmvs.filter((v) => v > rip).length / n : 0;
  const verdict: Stats["verdict"] =
    evRatioEmpirical >= 1.05
      ? pProfit >= 0.45
        ? "positive" // +EV and most single pulls profit
        : "top-heavy" // +EV on average, but most pulls lose — chase-driven
      : evRatioEmpirical >= 0.95
        ? "roughly-fair"
        : "negative";
  return {
    n,
    ripPrice: rip,
    officialEV: pack.officialEV,
    featuredCardFmv: pack.featuredCardFmv,
    empiricalMean: mean,
    meanCiLow: Math.max(0, mean - 1.96 * stdErr),
    meanCiHigh: mean + 1.96 * stdErr,
    median: median(fmvs),
    min: n ? fmvs[0] : 0,
    max: n ? fmvs[n - 1] : 0,
    evRatioOfficial: rip ? pack.officialEV / rip : 0,
    evRatioEmpirical,
    pProfit,
    claimGap: mean - pack.officialEV,
    tiers: tierBreakdown(pack.pulls),
    histogram: histogram(fmvs, rip),
    verdict,
  };
}

export type SimResult = {
  p10: number;
  p50: number;
  p90: number;
  mean: number;
  pProfit: number;
  worst: number;
  best: number;
  pnls: number[];
};

// Bootstrap Monte Carlo: resample N rips (with replacement) from the observed
// pulls, `trials` times, and return the P&L distribution. rng is injectable so
// the self-check is deterministic; the UI passes Math.random.
export function simulate(
  fmvs: number[],
  rip: number,
  nRips: number,
  trials: number,
  rng: () => number,
): SimResult {
  const pnls = new Array<number>(trials);
  for (let t = 0; t < trials; t++) {
    let value = 0;
    for (let i = 0; i < nRips; i++) value += fmvs[Math.floor(rng() * fmvs.length)];
    pnls[t] = value - nRips * rip;
  }
  pnls.sort((a, b) => a - b);
  const q = (p: number) => pnls[Math.min(pnls.length - 1, Math.floor(p * pnls.length))];
  return {
    p10: q(0.1),
    p50: q(0.5),
    p90: q(0.9),
    mean: sum(pnls) / trials,
    pProfit: pnls.filter((v) => v > 0).length / trials,
    worst: pnls[0],
    best: pnls[pnls.length - 1],
    pnls,
  };
}

// Seeded PRNG — used to make the Monte Carlo deterministic (stable across
// re-renders and identical on server + client, so no hydration jitter).
export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function demo() {
  const assert = (c: boolean, m: string) => {
    if (!c) throw new Error("FAIL: " + m);
  };
  const pack: Pack = {
    slug: "t",
    name: "T",
    packType: "perpetual",
    stage: "active",
    author: "x",
    description: "",
    ripPrice: 10,
    officialEV: 11,
    featuredCardFmv: 1000,
    // 4 pulls: two below rip, two above (one a chase); mean=(5+8+12+200)/4=56.25
    pulls: [
      { tokenId: "1", tier: "C", fmv: 5, pulledAt: "" },
      { tokenId: "2", tier: "C", fmv: 8, pulledAt: "" },
      { tokenId: "3", tier: "B", fmv: 12, pulledAt: "" },
      { tokenId: "4", tier: "A", fmv: 200, pulledAt: "" },
    ],
  };
  const s = packStats(pack);
  assert(s.n === 4, "n");
  assert(Math.abs(s.empiricalMean - 56.25) < 1e-9, "mean");
  assert(s.meanCiLow <= s.empiricalMean && s.empiricalMean <= s.meanCiHigh, "CI brackets the mean");
  assert(s.meanCiLow >= 0, "CI low floored at 0");
  assert(s.median === 10, "median (avg of 8 and 12)");
  assert(Math.abs(s.pProfit - 0.5) < 1e-9, "pProfit 2/4");
  assert(s.verdict === "positive", "verdict");
  assert(s.tiers[0].tier === "A", "top tier first by mean fmv");

  // top-heavy: mean well above rip, but 3 of 4 pulls lose → not a plain +EV.
  const th = packStats({ ...pack, ripPrice: 15, officialEV: 15 });
  assert(th.empiricalMean / 15 >= 1.02 && th.pProfit < 0.5, "setup: +EV mean, minority profit");
  assert(th.verdict === "top-heavy", "verdict is top-heavy, not positive");
  assert(sum(s.histogram.map((b) => b.count)) === 4, "histogram covers all pulls");
  // the $200 pull is 20× rip → lands in the 5×+ chase bin
  assert(s.histogram.find((b) => b.label === "5×+")!.count === 1, "chase bin");

  // simulate: if every card is worth exactly the rip, P&L is always 0.
  const flat = simulate([10, 10, 10], 10, 5, 200, () => 0.5);
  assert(flat.p50 === 0 && flat.worst === 0 && flat.pProfit === 0, "flat pack => zero P&L");
  // a +EV pack (mean 56.25 vs rip 10) should profit the vast majority of the time.
  const good = simulate([5, 8, 12, 200], 10, 20, 2000, mulberry32(42));
  assert(good.mean > 0 && good.pProfit > 0.9, "+EV pack profits over many rips");
  console.log("ev.ts self-check passed");
}

// @ts-ignore - import.meta.main is available in Node 24+
if (import.meta.main) demo();
