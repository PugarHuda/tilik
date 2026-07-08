import { packStats, type Pack } from "@/lib/ev";
import { usd, pct, ratio, timeAgo } from "@/lib/format";
import { ValueHistogram } from "./Charts";

const VERDICT = {
  positive: { label: "Leans +EV", cls: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30" },
  "roughly-fair": { label: "Roughly fair", cls: "bg-amber-500/15 text-amber-300 ring-amber-500/30" },
  negative: { label: "Leans −EV", cls: "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30" },
} as const;

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-zinc-800/40 px-4 py-3 ring-1 ring-white/5">
      <div className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-0.5 text-lg font-semibold text-zinc-100 tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-zinc-500">{sub}</div>}
    </div>
  );
}

export default function PackCard({ pack, updatedAt }: { pack: Pack; updatedAt: string }) {
  const s = packStats(pack);
  const v = VERDICT[s.verdict];

  // Fairness cross-check — neutral wording (§ positioning): never accuse.
  const gap = Math.abs(s.claimGap) / (s.officialEV || 1);
  const crossCheck =
    gap <= 0.15
      ? `consistent with their stated figure (within ${pct(gap)})`
      : s.claimGap > 0
        ? `running ${pct(gap)} above their stated figure over this sample`
        : `running ${pct(gap)} below their stated figure over this sample`;

  // Skew note: in gacha the mean can beat the rip while most pulls still lose.
  const skew = s.pProfit < 0.5;

  return (
    <section className="rounded-2xl bg-zinc-900/70 p-5 ring-1 ring-white/10 sm:p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-50">{pack.name}</h2>
          <p className="text-xs text-zinc-500">
            {pack.packType} gacha · by {pack.author}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${v.cls}`}>
          {v.label}
        </span>
      </header>

      {/* Hero: fairness cross-check */}
      <div className="mt-4 rounded-xl border border-white/10 bg-zinc-800/30 p-4">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
          Fairness cross-check
        </div>
        <p className="mt-1 text-sm leading-relaxed text-zinc-300">
          Renaiss states an expected value of{" "}
          <span className="font-semibold text-zinc-100">{usd(s.officialEV)}</span>. Across the last{" "}
          {s.n} observed pulls, the realized mean was{" "}
          <span className="font-semibold text-zinc-100">{usd(s.empiricalMean)}</span> —{" "}
          {crossCheck}.
        </p>
        <p className="mt-1 text-[11px] text-zinc-500">
          95% confidence interval on that mean: {usd(s.meanCiLow)} – {usd(s.meanCiHigh)} (n = {s.n} —
          a small sample; the interval is wide because a few high-value pulls swing the average).
        </p>
      </div>

      {/* Stat tiles */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Rip price" value={usd(s.ripPrice)} />
        <Stat label="Stated EV" value={usd(s.officialEV)} sub={`${ratio(s.evRatioOfficial)} of rip`} />
        <Stat
          label="Observed mean"
          value={usd(s.empiricalMean)}
          sub={`${ratio(s.evRatioEmpirical)} of rip`}
        />
        <Stat label="Top card in pool" value={usd(s.featuredCardFmv)} sub="the chase" />
      </div>

      {/* Distribution */}
      <div className="mt-5">
        <div className="mb-1 flex items-baseline justify-between">
          <h3 className="text-sm font-semibold text-zinc-200">
            Value of the last {s.n} pulls <span className="text-zinc-500">(× rip price)</span>
          </h3>
          <div className="flex gap-3 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1">
              <i className="h-2 w-2 rounded-full bg-rose-400" /> loss
            </span>
            <span className="flex items-center gap-1">
              <i className="h-2 w-2 rounded-full bg-emerald-400" /> profit
            </span>
            <span className="flex items-center gap-1">
              <i className="h-2 w-2 rounded-full bg-amber-400" /> chase
            </span>
          </div>
        </div>
        <ValueHistogram bins={s.histogram} />
        <p className="mt-2 text-sm text-zinc-400">
          <span className="font-semibold text-zinc-200">{pct(s.pProfit)}</span> of observed pulls
          were worth more than the {usd(s.ripPrice)} rip. Median pull:{" "}
          <span className="font-semibold text-zinc-200">{usd(s.median)}</span>.
          {skew && (
            <>
              {" "}
              Most pulls came in below the rip — the mean is lifted by rare high-value hits (up to{" "}
              {usd(s.max)}).
            </>
          )}
        </p>
      </div>

      {/* Tier odds */}
      <div className="mt-5">
        <h3 className="mb-2 text-sm font-semibold text-zinc-200">
          Observed odds by tier <span className="text-zinc-500">(last {s.n} pulls)</span>
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-zinc-500">
              <th className="pb-1 font-medium">Tier</th>
              <th className="pb-1 text-right font-medium">Seen</th>
              <th className="pb-1 text-right font-medium">Frequency</th>
              <th className="pb-1 text-right font-medium">Avg value</th>
            </tr>
          </thead>
          <tbody className="text-zinc-300">
            {s.tiers.map((t) => (
              <tr key={t.tier} className="border-t border-white/5">
                <td className="py-1.5 font-medium text-zinc-100">{t.tier}</td>
                <td className="py-1.5 text-right tabular-nums">{t.count}</td>
                <td className="py-1.5 text-right tabular-nums">{pct(t.share)}</td>
                <td className="py-1.5 text-right tabular-nums">{usd(t.meanFmv)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Provenance */}
      <details className="mt-4 text-xs text-zinc-500">
        <summary className="cursor-pointer select-none hover:text-zinc-300">
          Show the {s.n} real pulls behind these numbers
        </summary>
        <p className="mt-1 text-[11px] text-zinc-600">
          Snapshot of past pulls. This is a perpetual pool — cards rotate in and out, so a given card
          may no longer be in the pack.
        </p>
        <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
          {pack.pulls.map((p) => (
            <li key={p.tokenId} className="flex justify-between gap-2 tabular-nums">
              <span className="truncate text-zinc-600">card/{p.tokenId.slice(0, 10)}…</span>
              <span className="shrink-0 text-zinc-400">
                {p.tier} · {usd(p.fmv)} · {timeAgo(p.pulledAt)}
              </span>
            </li>
          ))}
        </ul>
      </details>

      <p className="mt-4 border-t border-white/5 pt-3 text-[11px] leading-relaxed text-zinc-600">
        Estimate under the <span className="text-zinc-400">observed-pulls</span> basis. Source:
        Renaiss CLI (beta) · sample: last {s.n} pulls · snapshot {timeAgo(updatedAt)}. Observed
        pulls are a small sample, not a guarantee of future draws — treat as an experimental
        reference, not a verified market fact.
      </p>
    </section>
  );
}
