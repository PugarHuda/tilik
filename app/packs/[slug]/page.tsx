import Link from "next/link";
import { notFound } from "next/navigation";
import packsData from "@/data/packs.json";
import { packStats, type Pack } from "@/lib/ev";
import { usd, usd0, pct } from "@/lib/format";
import { VERDICT } from "@/components/verdict";
import { Histogram, TierOdds } from "@/components/landing/Bars";
import { DetailHeader, DetailFooter } from "@/components/DetailChrome";

const packs = () => (packsData.packs as Pack[]).filter((p) => p.pulls.length);

export function generateStaticParams() {
  return packs().map((p) => ({ slug: p.slug }));
}

const pullColor = (m: number) => (m < 1 ? "#e23d53" : m < 2 ? "#16a34a" : "#e9a50b");

export default async function PackDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pack = packs().find((p) => p.slug === slug);
  if (!pack) notFound();
  const s = packStats(pack);
  const v = VERDICT[s.verdict];
  const sorted = [...pack.pulls].sort((a, b) => b.fmv - a.fmv);
  const best = Math.max(...pack.pulls.map((p) => p.fmv));
  const worst = Math.min(...pack.pulls.map((p) => p.fmv));

  return (
    <main className="min-h-screen bg-app text-ink">
      <DetailHeader crumb="Packs" title={pack.name} back="/app#packs" />
      <div className="mx-auto max-w-[1000px] px-6 py-8">
        {/* featured + summary */}
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-grad-panel p-7 text-white shadow-[0_26px_56px_rgba(59,25,140,.3)]">
            <div className="holo h-10 w-10 rounded-xl opacity-90" />
            <div className="mt-8">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">TOP CARD · the chase</span>
              <div className="mt-3 font-display text-2xl font-bold">Featured card in pool</div>
              <div className="mt-1 font-display text-[40px] font-bold leading-none">{usd0(s.featuredCardFmv)}</div>
              <div className="text-[13px] text-faint-violet">the advertised prize you&rsquo;re chasing</div>
            </div>
          </div>
          <div className="rounded-3xl border border-line bg-white p-7 shadow-[0_20px_46px_rgba(30,20,70,.06)]">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-semibold">Observed EV</span>
              <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: v.bg, color: v.color }}>{v.label}</span>
            </div>
            <div className="mt-3 font-display text-[52px] font-bold leading-none text-ink">{usd(s.empiricalMean)}</div>
            <div className="mt-1 text-[13px] text-muted">95% CI {usd0(s.meanCiLow)}–{usd0(s.meanCiHigh)} · Renaiss states {usd0(s.officialEV)}</div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {([["Median pull", usd0(s.median), "#12101a"], ["P(profit)", pct(s.pProfit), "#12101a"], ["Best pull", usd0(best), "#16a34a"], ["Worst pull", usd0(worst), "#e23d53"]] as const).map(([k, val, c]) => (
                <div key={k} className="rounded-xl bg-soft px-4 py-3"><div className="text-[11px] text-muted">{k}</div><div className="font-display text-lg font-bold" style={{ color: c }}>{val}</div></div>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <Link href="/app#simulator" className="rounded-xl bg-violet px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-mid">Simulate this pack →</Link>
              <Link href="/app#scanner" className="rounded-xl border border-line2 px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-soft">Cross-check a card</Link>
            </div>
          </div>
        </div>

        {/* dist + odds */}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-line bg-white p-7">
            <div className="text-sm font-semibold">Value distribution <span className="text-muted">(× rip)</span></div>
            <div className="mt-4"><Histogram stats={s} /></div>
          </div>
          <div className="rounded-3xl border border-line bg-white p-7">
            <div className="text-sm font-semibold">Observed odds by tier</div>
            <div className="mt-4"><TierOdds stats={s} /></div>
          </div>
        </div>

        {/* last 30 pulls */}
        <div className="mt-5 rounded-3xl border border-line bg-white p-7">
          <div className="text-sm font-semibold">Last {s.n} pulls <span className="text-muted">— sorted by value</span></div>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {sorted.map((p, i) => {
              const m = p.fmv / pack.ripPrice;
              return (
                <div key={i} className="rounded-xl border border-line bg-soft px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xs font-bold" style={{ color: p.tier === "A" ? "#e9a50b" : p.tier === "B" ? "#f25fa8" : "#6c3bf4" }}>{p.tier}</span>
                    <span className="font-display text-[11px] font-semibold" style={{ color: pullColor(m) }}>{m.toFixed(1)}×</span>
                  </div>
                  <div className="mt-0.5 font-display text-sm font-bold tabular-nums">{usd0(p.fmv)}</div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-muted">Historical snapshot — this is a perpetual pool, so these exact cards may have rotated out. Estimates, not verified facts.</p>
        </div>
      </div>
      <DetailFooter />
    </main>
  );
}
