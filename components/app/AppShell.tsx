"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { packStats, mulberry32, type Pack } from "@/lib/ev";
import { listingSignals, type Listing } from "@/lib/scanner";
import { usd, usd0, pct } from "@/lib/format";
import { Mark } from "@/components/Logo";
import { VERDICT } from "@/components/verdict";
import { Histogram, TierOdds } from "@/components/landing/Bars";

type View = "packs" | "scanner" | "simulator" | "onchain";
const META: Record<View, { label: string; title: string; sub: string; icon: string }> = {
  packs: { label: "Packs", title: "Pack transparency", sub: "Realized EV, odds and an honest verdict from the last 30 pulls", icon: "▦" },
  scanner: { label: "Scanner", title: "Price scanner", sub: "Cross-check any graded card against an independent estimate", icon: "◎" },
  simulator: { label: "Simulator", title: "Should I rip?", sub: "Monte Carlo P&L, bootstrapped from observed pulls", icon: "◧" },
  onchain: { label: "On-chain", title: "On-chain provenance", sub: "The BNB Chain record behind each listing", icon: "⬡" },
};

function monte(pack: Pack, N: number, idx: number) {
  const rand = mulberry32(idx * 1000 + N * 7 + 12345);
  const arr = pack.pulls.map((p) => p.fmv);
  const results: number[] = [];
  for (let t = 0; t < 2000; t++) {
    let sum = 0;
    for (let i = 0; i < N; i++) sum += arr[Math.floor(rand() * arr.length)];
    results.push(sum - N * pack.ripPrice);
  }
  const mean = results.reduce((a, b) => a + b, 0) / 2000;
  const pprofit = results.filter((x) => x > 0).length / 2000;
  const min = Math.min(...results), max = Math.max(...results);
  const B = 13, span = max - min || 1;
  const counts = new Array(B).fill(0);
  results.forEach((v) => {
    let b = Math.floor(((v - min) / span) * B);
    b = Math.max(0, Math.min(B - 1, b));
    counts[b]++;
  });
  const maxC = Math.max(...counts, 1);
  const bins = counts.map((c, i) => ({ h: 4 + (c / maxC) * 96, up: min + (span * (i + 0.5)) / B > 0 }));
  return { mean, pprofit, min, max, bins, zeroPos: Math.max(0, Math.min(100, ((0 - min) / span) * 100)), spend: N * pack.ripPrice };
}

const signed0 = (n: number) => (n >= 0 ? "+" : "−") + usd0(Math.abs(n));

export default function AppShell({ packs, listings }: { packs: Pack[]; listings: Listing[] }) {
  const [view, setView] = useState<View>("packs");
  const [packSlug, setPackSlug] = useState(packs[0].slug);
  const [ripN, setRipN] = useState(5);
  const [cert, setCert] = useState(listings[0]?.cert ?? "");

  useEffect(() => {
    const h = (location.hash || "").replace("#", "") as View;
    if (META[h]) setView(h);
  }, []);
  function go(v: View) {
    setView(v);
    if (typeof history !== "undefined") history.replaceState(null, "", "#" + v);
  }

  const pack = packs.find((p) => p.slug === packSlug)!;
  const packIdx = packs.findIndex((p) => p.slug === packSlug);
  const s = useMemo(() => packStats(pack), [pack]);
  const v = VERDICT[s.verdict];
  const mc = useMemo(() => monte(pack, ripN, packIdx), [pack, ripN, packIdx]);
  const listing = listings.find((l) => l.cert === cert) ?? listings[0];

  return (
    <div className="flex min-h-screen bg-app text-ink">
      {/* SIDEBAR */}
      <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col bg-ink p-5 md:flex">
        <Link href="/" className="mb-8 flex items-center gap-2.5">
          <Mark size={30} variant="reversed" />
          <span className="font-display text-lg font-bold text-white" style={{ letterSpacing: "-0.04em" }}>tilik</span>
        </Link>
        <div className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[2px] text-faint">Workspace</div>
        <nav className="space-y-1">
          {(Object.keys(META) as View[]).map((k) => {
            const active = view === k;
            return (
              <button
                key={k}
                onClick={() => go(k)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14.5px] font-medium transition ${active ? "text-white" : "text-faint hover:text-white"}`}
                style={active ? { background: "rgba(108,59,244,.22)" } : undefined}
              >
                <span
                  className="flex items-center justify-center rounded-lg text-sm"
                  style={active ? { background: "linear-gradient(140deg,#6c3bf4,#f25fa8)", color: "#fff", width: 26, height: 26 } : { background: "rgba(255,255,255,.08)", color: "#c9b6ff", width: 26, height: 26 }}
                >
                  {META[k].icon}
                </span>
                {META[k].label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3 pt-6">
          <div className="rounded-xl bg-white/5 px-3 py-2.5 text-[11px] text-gold">Estimates only — not financial advice.</div>
          <Link href="/" className="block px-2 text-[13px] text-faint hover:text-white">← Back to site</Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* HEADER */}
        <header className="sticky top-0 z-20 border-b border-line bg-app/85 px-5 py-4 backdrop-blur sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[12px] text-muted">Tilik · {META[view].label}</div>
              <h1 className="truncate font-display text-[22px] font-bold tracking-[-0.5px] sm:text-[26px]">{META[view].title}</h1>
              <p className="truncate text-[13px] text-bodytext">{META[view].sub}</p>
            </div>
            <div className="hidden shrink-0 items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-[12.5px] font-medium text-bodytext sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-profit" />
              Snapshot live · {pack.name} {usd0(pack.ripPrice)}/rip
            </div>
          </div>
          {/* mobile nav */}
          <nav className="mt-3 flex gap-1.5 md:hidden">
            {(Object.keys(META) as View[]).map((k) => (
              <button key={k} onClick={() => go(k)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${view === k ? "bg-ink text-white" : "bg-white text-bodytext"}`}>
                {META[k].label}
              </button>
            ))}
          </nav>
        </header>

        <div className="mx-auto max-w-[1000px] px-5 py-7 sm:px-8">
          {/* PACKS */}
          {view === "packs" && (
            <>
              <PackTabs packs={packs} active={packSlug} onPick={setPackSlug} />
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <div className="rounded-3xl bg-grad-panel p-7 text-white shadow-[0_26px_56px_rgba(59,25,140,.3)]">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-lg font-semibold">{pack.name}</span>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: v.bg, color: v.color }}>{v.label}</span>
                  </div>
                  <div className="mt-6 text-[13px] text-faint-violet">Observed mean EV (last {s.n} pulls)</div>
                  <div className="font-display text-[52px] font-bold leading-none">{usd(s.empiricalMean)}</div>
                  <div className="mt-1 text-[13px] text-faint-violet">95% CI {usd0(s.meanCiLow)}–{usd0(s.meanCiHigh)} · Renaiss states {usd0(s.officialEV)}</div>
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {([["Rip", usd0(s.ripPrice)], ["Median", usd0(s.median)], ["P(profit)", pct(s.pProfit)]] as const).map(([k, val]) => (
                      <div key={k} className="rounded-xl bg-white/10 px-3 py-2.5"><div className="text-[11px] text-faint-violet">{k}</div><div className="font-display text-lg font-bold">{val}</div></div>
                    ))}
                  </div>
                  <Link href={`/packs/${pack.slug}`} className="mt-6 inline-block rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/25">View full breakdown →</Link>
                </div>
                <div className="rounded-3xl border border-line bg-white p-7 shadow-[0_20px_46px_rgba(30,20,70,.06)]">
                  <div className="text-sm font-semibold">Value of the last {s.n} pulls <span className="text-muted">(× rip)</span></div>
                  <div className="mt-4"><Histogram stats={s} /></div>
                  <div className="mt-6 text-sm font-semibold">Observed odds by tier</div>
                  <div className="mt-3"><TierOdds stats={s} /></div>
                </div>
              </div>
            </>
          )}

          {/* SCANNER */}
          {view === "scanner" && listing && (
            <ScannerView listings={listings} cert={cert} setCert={setCert} listing={listing} />
          )}

          {/* SIMULATOR */}
          {view === "simulator" && (
            <>
              <PackTabs packs={packs} active={packSlug} onPick={setPackSlug} />
              <div className="mt-5 rounded-3xl bg-ink p-7 text-white sm:p-8">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="font-display text-lg font-semibold">Rip {pack.name} {ripN}× — bootstrap of {(2000).toLocaleString("en-US")} runs</div>
                  <div className="text-[13px] text-faint">total spend {usd0(mc.spend)}</div>
                </div>
                <input type="range" min={1} max={15} step={1} value={ripN} onChange={(e) => setRipN(+e.target.value)} className="tilik-range mt-4 w-full" aria-label="Number of rips" />
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/5 p-5">
                    <div className="text-[12px] text-faint">Chance you finish up</div>
                    <div className="font-display text-[40px] font-bold" style={{ color: mc.pprofit >= 0.5 ? "#7ee0a0" : mc.pprofit >= 0.4 ? "#f7c948" : "#ff8fa0" }}>{Math.round(mc.pprofit * 100)}%</div>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-5">
                    <div className="text-[12px] text-faint">Expected P&L</div>
                    <div className="font-display text-[40px] font-bold" style={{ color: mc.mean >= 0 ? "#7ee0a0" : "#ff8fa0" }}>{signed0(mc.mean)}</div>
                  </div>
                </div>
                <div className="mt-6 text-[12px] text-faint">P&L distribution</div>
                <div className="relative mt-2 flex h-40 items-end gap-1.5" role="img" aria-label={`P&L distribution: ${Math.round(mc.pprofit * 100)}% chance of profit, expected ${signed0(mc.mean)}`}>
                  {mc.bins.map((b, i) => (
                    <div key={i} className="flex-1 rounded-t" style={{ height: `${b.h}%`, background: b.up ? "#16a34a" : "#e23d53" }} />
                  ))}
                  <div className="absolute bottom-0 top-0 w-px bg-white/40" style={{ left: `${mc.zeroPos}%` }}>
                    <span className="absolute -top-1 left-1 text-[9px] text-faint">break-even</span>
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-faint"><span>worst {signed0(mc.min)}</span><span>best {signed0(mc.max)}</span></div>
                <p className="mt-3 text-[11px] text-faint">Resampled from a 30-pull sample — an illustration of variance, not a prediction.</p>
              </div>
            </>
          )}

          {/* ONCHAIN */}
          {view === "onchain" && listing && <OnchainView listing={listing} />}
        </div>
      </div>
    </div>
  );
}

function PackTabs({ packs, active, onPick }: { packs: Pack[]; active: string; onPick: (s: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {packs.map((p) => (
        <button
          key={p.slug}
          onClick={() => onPick(p.slug)}
          className={`rounded-full border px-5 py-2.5 font-display text-[14.5px] font-semibold transition ${active === p.slug ? "border-ink bg-ink text-white shadow-[0_8px_20px_rgba(18,16,26,.2)]" : "border-line2 bg-white text-bodytext hover:border-violet"}`}
        >
          {p.name} · {usd0(p.ripPrice)}
        </button>
      ))}
    </div>
  );
}

function bandStyle(band: string) {
  if (band === "above") return { bg: "#fef1f3", color: "#e23d53", label: "▲ FMV above independent" };
  if (band === "below") return { bg: "#ecfdf3", color: "#16a34a", label: "▼ FMV below independent" };
  return { bg: "#f0ebff", color: "#6c3bf4", label: "≈ FMV in line" };
}

function PriceBar({ label, value, width, color }: { label: string; value: string; width: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-[13px]"><span className="text-bodytext">{label}</span><span className="font-display font-semibold tabular-nums">{value}</span></div>
      <div className="h-2.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.max(3, width)}%`, background: color }} /></div>
    </div>
  );
}

type CertResult = { found: boolean; cached?: boolean; error?: string; card?: { name: string; setName: string; grade: string; gradingCompany: string; imageUrl: string | null }; index?: { estimate: number | null; deltaPct: number | null; confidence: string | null; population: number | null; lastSaleAt: string | null } };

function ScannerView({ listings, cert, setCert, listing }: { listings: Listing[]; cert: string; setCert: (c: string) => void; listing: Listing }) {
  const [query, setQuery] = useState("");
  const [res, setRes] = useState<CertResult | null>(null);
  const [loading, setLoading] = useState(false);
  const sig = listingSignals(listing);
  const max = Math.max(listing.ask, listing.renaissFmv, listing.index?.estimate ?? 0);
  const bs = bandStyle(sig.fmvBand);

  async function lookup(c: string) {
    const q = c.trim().toUpperCase();
    if (!q) return;
    setLoading(true);
    setRes(null);
    try {
      const r = await fetch(`/api/cert/${encodeURIComponent(q)}`);
      setRes(await r.json());
    } catch {
      setRes({ found: false, error: "Network error." });
    } finally {
      setLoading(false);
    }
  }

  async function identify(f: File) {
    setLoading(true);
    setRes(null);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const r = await fetch("/api/identify", { method: "POST", body: fd });
      setRes(await r.json());
    } catch {
      setRes({ found: false, error: "Upload failed." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      {/* cached listing cross-check */}
      <div className="rounded-3xl border border-line bg-white p-7 shadow-[0_20px_46px_rgba(30,20,70,.06)]">
        <div className="mb-4 flex flex-wrap gap-2">
          {listings.map((l) => (
            <button key={l.cert} onClick={() => setCert(l.cert)} className={`rounded-full border px-3 py-1.5 font-display text-[12.5px] font-semibold transition ${cert === l.cert ? "border-violet bg-violet text-white" : "border-line2 bg-white text-violet hover:border-violet"}`}>
              {l.cert}
            </button>
          ))}
        </div>
        <div className="flex items-start gap-4">
          {listing.image && <Image src={listing.image} alt={listing.name} width={72} height={72} className="h-[72px] w-[72px] shrink-0 rounded-xl object-cover ring-1 ring-line" />}
          <div className="min-w-0">
            <div className="truncate font-display text-base font-semibold">{listing.name}</div>
            <div className="text-xs text-muted">{listing.gradingCompany} {listing.grade} · {listing.cert}</div>
            <span className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold" style={{ background: bs.bg, color: bs.color }}>{bs.label}</span>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          <PriceBar label="Ask" value={sig.askListed ? usd(listing.ask) : "—"} width={sig.askListed ? (listing.ask / max) * 100 : 0} color="#e23d53" />
          <PriceBar label="Renaiss FMV" value={usd(listing.renaissFmv)} width={(listing.renaissFmv / max) * 100} color="#6c3bf4" />
          <PriceBar label="Independent" value={listing.index ? usd(listing.index.estimate) : "—"} width={listing.index ? (listing.index.estimate / max) * 100 : 0} color="#16a34a" />
        </div>
        {listing.index && (
          <div className="mt-4 flex flex-wrap gap-x-3 text-[11px] text-muted">
            {listing.index.deltaPct != null && <span className={listing.index.deltaPct >= 0 ? "text-profit" : "text-loss"}>{listing.index.deltaPct >= 0 ? "▲" : "▼"} {Math.abs(listing.index.deltaPct).toFixed(1)}%</span>}
            {listing.index.confidence && <span>confidence: {listing.index.confidence}</span>}
            {listing.index.population != null && <span>PSA pop {listing.index.population}</span>}
            <Link href={`/cards/${listing.cert}`} className="ml-auto font-semibold text-violet hover:underline">Full card →</Link>
          </div>
        )}
      </div>
      {/* live lookup */}
      <div className="rounded-3xl border border-line bg-soft p-6">
        <div className="font-display text-base font-semibold">Check any cert</div>
        <p className="mt-1 text-[13px] text-bodytext">Independent valuation from the Renaiss OS Index.</p>
        <form onSubmit={(e) => { e.preventDefault(); lookup(query); }} className="mt-3 flex gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. PSA82643863" aria-label="Grading cert" className="min-w-0 flex-1 rounded-lg border border-line2 bg-white px-3 py-2 text-sm outline-none focus:border-violet" />
          <button type="submit" disabled={loading} className="rounded-lg bg-violet px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{loading ? "…" : "Look up"}</button>
        </form>
        <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-[12px] font-medium text-violet hover:underline">
          <span>📸 identify from a photo of the slab</span>
          <span className="rounded bg-line px-1 text-[10px] text-muted">beta</span>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) identify(f); e.target.value = ""; }} />
        </label>
        {res && (
          <div className="mt-4 rounded-2xl border border-line bg-white p-4">
            {res.found && res.index ? (
              <>
                <div className="text-sm font-semibold">{res.card?.name}</div>
                <div className="text-[11px] text-muted">{res.card?.setName} · {res.card?.gradingCompany} {res.card?.grade}</div>
                <div className="mt-2 font-display text-2xl font-bold">{res.index.estimate != null ? usd(res.index.estimate) : "—"} <span className="text-xs font-normal text-muted">independent</span></div>
                <div className="mt-1 flex flex-wrap gap-x-2 text-[11px] text-muted">
                  {res.index.deltaPct != null && <span className={res.index.deltaPct >= 0 ? "text-profit" : "text-loss"}>{res.index.deltaPct >= 0 ? "▲" : "▼"} {Math.abs(res.index.deltaPct).toFixed(1)}%</span>}
                  {res.index.confidence && <span>conf: {res.index.confidence}</span>}
                  {res.index.population != null && <span>pop {res.index.population}</span>}
                  {res.cached && <span className="rounded bg-line px-1">cached</span>}
                </div>
              </>
            ) : (
              <p className="text-sm text-bodytext">{res.error ?? "No record found."}</p>
            )}
          </div>
        )}
        <p className="mt-3 text-[11px] text-muted">Independent valuations via Renaiss OS Index (beta) · rate-limited public tier.</p>
      </div>
    </div>
  );
}

function OnchainView({ listing }: { listing: Listing }) {
  const label: Record<string, { c: string; bg: string }> = {
    mint: { c: "#6c3bf4", bg: "#e8ddff" },
    transfer: { c: "#f25fa8", bg: "#ffe0f0" },
    sell: { c: "#e9a50b", bg: "#fff2cf" },
  };
  return (
    <div className="rounded-3xl border border-line bg-white p-7 shadow-[0_20px_46px_rgba(30,20,70,.06)]">
      <div className="font-display text-base font-semibold">{listing.name}</div>
      <div className="text-xs text-muted">{listing.cert} · BNB Chain events — the record behind Renaiss&rsquo; &ldquo;verifiable on-chain&rdquo; claim.</div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[440px] text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-muted">
              <th className="pb-2 font-medium">Event</th><th className="pb-2 font-medium">To</th><th className="pb-2 font-medium">When</th><th className="pb-2 text-right font-medium">Tx</th>
            </tr>
          </thead>
          <tbody>
            {listing.transfers.map((t) => {
              const st = label[t.type] ?? label.transfer;
              return (
                <tr key={t.txHash} className="border-t border-line">
                  <td className="py-2.5"><span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize" style={{ background: st.bg, color: st.c }}>{t.type}</span></td>
                  <td className="py-2.5 font-mono text-[12px] text-bodytext">{t.to ? `${t.to.slice(0, 6)}…${t.to.slice(-4)}` : "—"}</td>
                  <td className="py-2.5 text-[12px] text-muted">{new Date(t.ts * 1000).toISOString().slice(0, 10)}</td>
                  <td className="py-2.5 text-right"><a href={`https://bscscan.com/tx/${t.txHash}`} target="_blank" rel="noreferrer" className="font-semibold text-violet hover:underline">↗</a></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
