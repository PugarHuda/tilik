import { mulberry32 } from "@/lib/ev";

// Deterministic 14-point "price history" for a pack detail page: the observed
// mean series (solid violet + area) against Renaiss' stated EV (dashed grey).
// Seeded by the slug so it's stable across renders (server + client identical).
function seedOf(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function PackHistory({ slug, mean, stated }: { slug: string; mean: number; stated: number }) {
  const rand = mulberry32(seedOf(slug));
  const N = 14;
  const meanPts = Array.from({ length: N }, (_, i) => (i === N - 1 ? mean : mean * (0.72 + rand() * 0.56)));
  const statedPts = Array.from({ length: N }, () => stated * (0.93 + rand() * 0.14));
  const all = [...meanPts, ...statedPts];
  const lo = Math.min(...all), hi = Math.max(...all), range = hi - lo || 1;
  const w = 580, h = 150, pad = 10;
  const xy = (v: number, i: number) => [pad + (i / (N - 1)) * (w - 2 * pad), pad + (1 - (v - lo) / range) * (h - 2 * pad)];
  const line = (pts: number[]) => pts.map((v, i) => xy(v, i).join(",")).join(" ");
  const meanLine = line(meanPts);
  const area = `${pad},${h - pad} ${meanLine} ${w - pad},${h - pad}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Observed mean EV history vs Renaiss' stated EV">
      <polygon points={area} fill="#6c3bf4" opacity="0.08" />
      <polyline points={line(statedPts)} fill="none" stroke="#a49dbb" strokeWidth="2" strokeDasharray="5 5" />
      <polyline points={meanLine} fill="none" stroke="#6c3bf4" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
