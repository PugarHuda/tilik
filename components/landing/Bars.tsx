import type { Stats } from "@/lib/ev";
import { usd, pct } from "@/lib/format";

const BIN_COLOR = { loss: "#e23d53", profit: "#16a34a", chase: "#e9a50b" } as const;
const TIER_COLOR: Record<string, string> = { A: "#e9a50b", B: "#f25fa8", C: "#6c3bf4" };

export function Histogram({ stats }: { stats: Stats }) {
  const max = Math.max(...stats.histogram.map((b) => b.count), 1);
  return (
    <div>
      <div className="flex h-32 items-end gap-1.5" role="img" aria-label={`Value distribution of ${stats.n} pulls`}>
        {stats.histogram.map((b) => (
          <div key={b.label} className="flex flex-1 flex-col items-center justify-end gap-1">
            <div
              className="w-full rounded-t-md transition-[height] duration-500"
              style={{ height: `${8 + (b.count / max) * 92}%`, background: BIN_COLOR[b.kind] }}
              title={`${b.label}: ${b.count}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        {stats.histogram.map((b) => (
          <div key={b.label} className="flex-1 text-center text-[9px] leading-tight text-muted">
            {b.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TierOdds({ stats }: { stats: Stats }) {
  const maxFreq = Math.max(...stats.tiers.map((t) => t.share), 0.0001);
  return (
    <div className="space-y-2.5">
      {stats.tiers.map((t) => (
        <div key={t.tier} className="flex items-center gap-3">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white font-display"
            style={{ background: TIER_COLOR[t.tier] ?? "#6c3bf4" }}
          >
            {t.tier}
          </span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${(t.share / maxFreq) * 100}%`, background: TIER_COLOR[t.tier] ?? "#6c3bf4" }}
            />
          </div>
          <span className="w-10 shrink-0 text-right text-xs font-semibold text-bodytext font-display">
            {pct(t.share)}
          </span>
          <span className="w-16 shrink-0 text-right text-xs font-semibold text-ink font-display tabular-nums">
            {usd(t.meanFmv)}
          </span>
        </div>
      ))}
    </div>
  );
}
