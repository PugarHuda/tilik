"use client";
import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import { simulate } from "@/lib/ev";
import { usd } from "@/lib/format";

export type SimPack = { slug: string; name: string; ripPrice: number; fmvs: number[] };

const TRIALS = 5000;
const signed = (n: number) => (n >= 0 ? "+" : "−") + usd(Math.abs(n));

function binPnls(pnls: number[]) {
  // Clip the long right tail (rare grails) so the shape stays readable.
  const lo = pnls[Math.floor(0.01 * pnls.length)];
  const hi = pnls[Math.floor(0.95 * pnls.length)];
  const span = hi - lo || 1;
  const N = 24;
  const bins = Array.from({ length: N }, (_, i) => ({
    x: lo + (span * (i + 0.5)) / N,
    count: 0,
  }));
  for (const v of pnls) {
    const idx = Math.min(N - 1, Math.max(0, Math.floor(((v - lo) / span) * N)));
    bins[idx].count++;
  }
  return bins;
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl bg-zinc-800/40 px-4 py-3 ring-1 ring-white/5">
      <div className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</div>
      <div className={`mt-0.5 text-lg font-semibold tabular-nums ${tone ?? "text-zinc-100"}`}>
        {value}
      </div>
    </div>
  );
}

export default function Simulator({ packs }: { packs: SimPack[] }) {
  const [slug, setSlug] = useState(packs[0].slug);
  const [rips, setRips] = useState(10);
  const pack = packs.find((p) => p.slug === slug)!;

  // Monte Carlo uses Math.random — run it only after mount so the server HTML
  // and the first client render match (no hydration mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sim = useMemo(
    () => (mounted ? simulate(pack.fmvs, pack.ripPrice, rips, TRIALS, Math.random) : null),
    [pack, rips, mounted],
  );
  const bins = useMemo(() => (sim ? binPnls(sim.pnls) : []), [sim]);
  const spend = rips * pack.ripPrice;

  return (
    <section className="rounded-2xl bg-zinc-900/70 p-5 ring-1 ring-white/10 sm:p-6">
      <h2 className="text-xl font-bold text-zinc-50">Should I rip?</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Monte Carlo: rip a pack {rips}× and see the range of outcomes, resampled {TRIALS.toLocaleString("en-US")}{" "}
        times from its last {pack.fmvs.length} observed pulls.
      </p>

      {/* Controls */}
      <div className="mt-4 flex flex-wrap gap-2">
        {packs.map((p) => (
          <button
            key={p.slug}
            onClick={() => setSlug(p.slug)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ring-1 transition ${
              p.slug === slug
                ? "bg-emerald-500/15 text-emerald-200 ring-emerald-500/40"
                : "bg-zinc-800/40 text-zinc-400 ring-white/5 hover:text-zinc-200"
            }`}
          >
            {p.name} · {usd(p.ripPrice)}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between text-sm">
          <label htmlFor="rips" className="text-zinc-400">
            Number of rips: <span className="font-semibold text-zinc-100 tabular-nums">{rips}</span>
          </label>
          <span className="text-zinc-500 tabular-nums">total spend {usd(spend)}</span>
        </div>
        <input
          id="rips"
          type="range"
          min={1}
          max={100}
          value={rips}
          onChange={(e) => setRips(Number(e.target.value))}
          className="mt-2 w-full accent-emerald-400"
        />
      </div>

      {!sim ? (
        <div className="mt-5 flex h-[316px] items-center justify-center text-sm text-zinc-500">
          Simulating {TRIALS.toLocaleString("en-US")} runs…
        </div>
      ) : (
        <>
          {/* Results */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric
              label="Expected P&L"
              value={signed(sim.mean)}
              tone={sim.mean >= 0 ? "text-emerald-300" : "text-rose-300"}
            />
            <Metric label="Chance of profit" value={`${(sim.pProfit * 100).toFixed(0)}%`} />
            <Metric label="Typical range (p10–p90)" value={`${signed(sim.p10)} … ${signed(sim.p90)}`} />
            <Metric label="Median outcome" value={signed(sim.p50)} />
          </div>

          {/* Distribution */}
          <div className="mt-5">
            <h3 className="mb-1 text-sm font-semibold text-zinc-200">
              P&L distribution over {TRIALS.toLocaleString("en-US")} simulated runs
            </h3>
            <div
              role="img"
              aria-label={`P&L distribution over ${TRIALS} simulated runs of ${rips} rips: expected ${signed(
                sim.mean,
              )}, ${(sim.pProfit * 100).toFixed(0)}% chance of profit, typical range ${signed(
                sim.p10,
              )} to ${signed(sim.p90)}.`}
            >
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={bins} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    tickFormatter={(v: number) => signed(v)}
                    tick={{ fill: "#a1a1aa", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: "#ffffff10" }}
                    contentStyle={{
                      background: "#18181b",
                      border: "1px solid #3f3f46",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelFormatter={(v: number) => `≈ ${signed(v)}`}
                    formatter={(v: number) => [`${v} runs`, "count"]}
                  />
                  <ReferenceLine x={0} stroke="#71717a" strokeDasharray="3 3" />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                    {bins.map((b, i) => (
                      <Cell key={i} fill={b.x >= 0 ? "#34d399" : "#fb7185"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
              Best of {TRIALS.toLocaleString("en-US")} runs: {signed(sim.best)} · worst: {signed(sim.worst)}.
              The right tail (rare high-value pulls) is clipped for readability. Resampled from a
              30-pull sample — an illustration of variance, not a prediction of your outcome.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
