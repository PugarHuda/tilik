import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import scannerData from "@/data/scanner.json";
import { listingSignals, type Listing } from "@/lib/scanner";
import { usd } from "@/lib/format";
import { DetailHeader, DetailFooter } from "@/components/DetailChrome";

const listings = () => scannerData.listings as Listing[];
export function generateStaticParams() {
  return listings().map((l) => ({ cert: l.cert }));
}

export async function generateMetadata({ params }: { params: Promise<{ cert: string }> }) {
  const { cert } = await params;
  const l = listings().find((x) => x.cert.toUpperCase() === cert.toUpperCase());
  if (!l) return { title: "Card not found · Tilik" };
  return {
    title: `${l.cert} — independent valuation · Tilik`,
    description: `${l.name} (${l.gradingCompany} ${l.grade}): Renaiss FMV vs an independent estimate${l.index ? ` of ${usd(l.index.estimate)}` : ""}. Cross-check before you buy.`,
  };
}

function bandPill(band: string) {
  if (band === "above") return { bg: "#fef1f3", color: "#e23d53", label: "▲ Ask sits ABOVE the estimate" };
  if (band === "below") return { bg: "#ecfdf3", color: "#16a34a", label: "▼ Ask sits BELOW the estimate" };
  return { bg: "#f0ebff", color: "#6c3bf4", label: "≈ Ask is in line" };
}

function Spark({ data }: { data: number[] }) {
  if (!data || data.length < 2) return null;
  const w = 560, h = 140, pad = 10;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const up = data[data.length - 1] >= data[0];
  const color = up ? "#16a34a" : "#e23d53";
  const pts = data.map((v, i) => [pad + (i / (data.length - 1)) * (w - 2 * pad), pad + (1 - (v - min) / range) * (h - 2 * pad)]);
  const line = pts.map((p) => p.join(",")).join(" ");
  const area = `${pad},${h - pad} ${line} ${w - pad},${h - pad}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label={`Sale price history, ${up ? "up" : "down"}`}>
      <polygon points={area} fill={color} opacity="0.1" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export default async function CardDetail({ params }: { params: Promise<{ cert: string }> }) {
  const { cert } = await params;
  const l = listings().find((x) => x.cert.toUpperCase() === cert.toUpperCase());
  if (!l) notFound();
  const sig = listingSignals(l);
  const idx = l.index;
  const max = Math.max(l.ask, l.renaissFmv, idx?.estimate ?? 0);
  const bp = bandPill(sig.askBand);
  const premium = idx ? (l.ask / idx.estimate - 1) * 100 : 0;

  const impact =
    sig.fmvBand === "above"
      ? "Renaiss' FMV runs above the independent estimate here — a pack EV built on FMV like this may be optimistic. Weigh the observed pulls too."
      : sig.fmvBand === "below"
        ? "Renaiss' FMV sits below the independent estimate — the observed EV holds up, arguably conservative."
        : "Renaiss' FMV is in line with the independent estimate — reasonable, though it's always worth cross-checking.";

  return (
    <main className="min-h-screen bg-app text-ink">
      <DetailHeader crumb="Scanner" title={l.cert} back="/app#scanner" />
      <div className="mx-auto max-w-[1000px] px-6 py-8">
        <div className="grid gap-5 lg:grid-cols-2">
          {/* art */}
          <div className="rounded-3xl border border-line bg-white p-7 shadow-[0_20px_46px_rgba(30,20,70,.06)]">
            <div className="flex items-start gap-4">
              {l.image ? (
                <Image src={l.image} alt={l.name} width={110} height={150} className="h-[150px] w-[110px] shrink-0 rounded-xl object-cover ring-1 ring-line" />
              ) : (
                <div className="holo h-[150px] w-[110px] shrink-0 rounded-xl opacity-80" />
              )}
              <div className="min-w-0">
                <div className="font-display text-lg font-semibold">{l.name}</div>
                <div className="mt-1 text-sm text-muted">{l.gradingCompany} {l.grade}</div>
                <div className="mt-1 text-sm text-muted">{l.cert}</div>
                {idx?.population != null && <div className="mt-3 inline-block rounded-full bg-soft px-3 py-1 text-xs font-semibold text-bodytext">PSA pop {idx.population}</div>}
              </div>
            </div>
          </div>
          {/* valuation */}
          <div className="rounded-3xl border border-line bg-white p-7 shadow-[0_20px_46px_rgba(30,20,70,.06)]">
            <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold" style={{ background: bp.bg, color: bp.color }}>{bp.label}</span>
            {idx && sig.askListed && (
              <div className="mt-2 text-[13px] text-muted">Ask premium <span className="font-display font-semibold" style={{ color: premium >= 0 ? "#e23d53" : "#16a34a" }}>{premium >= 0 ? "+" : "−"}{Math.abs(premium).toFixed(0)}%</span> vs independent</div>
            )}
            <div className="mt-4 space-y-3">
              <Bar label="Ask" value={sig.askListed ? usd(l.ask) : "—"} width={sig.askListed ? (l.ask / max) * 100 : 0} color="#e23d53" />
              <Bar label="Renaiss FMV" value={usd(l.renaissFmv)} width={(l.renaissFmv / max) * 100} color="#6c3bf4" />
              <Bar label="Independent est." value={idx ? usd(idx.estimate) : "—"} width={idx ? (idx.estimate / max) * 100 : 0} color="#16a34a" />
            </div>
            <p className="mt-4 text-[11px] text-muted">Independent valuation via Renaiss OS Index (beta) · estimate, not a verified fact.</p>
          </div>
        </div>

        {/* history + stats */}
        {idx?.spark && idx.spark.length > 1 && (
          <div className="mt-5 rounded-3xl border border-line bg-white p-7">
            <div className="text-sm font-semibold">Sale price history</div>
            <div className="mt-3"><Spark data={idx.spark} /></div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {([["Last sale", idx.lastSaleAt?.slice(0, 10) ?? "—"], ["30-day trend", idx.deltaPct != null ? `${idx.deltaPct >= 0 ? "+" : "−"}${Math.abs(idx.deltaPct).toFixed(1)}%` : "—"], ["PSA population", idx.population != null ? String(idx.population) : "—"], ["Confidence", idx.confidence ?? "—"]] as const).map(([k, val]) => (
                <div key={k} className="rounded-xl bg-soft px-4 py-3"><div className="text-[11px] text-muted">{k}</div><div className="font-display text-base font-bold capitalize">{val}</div></div>
              ))}
            </div>
          </div>
        )}

        {/* provenance */}
        {l.transfers.length > 0 && (
          <div className="mt-5 rounded-3xl border border-line bg-white p-7">
            <div className="text-sm font-semibold">On-chain provenance</div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead><tr className="text-left text-[11px] uppercase tracking-wide text-muted"><th className="pb-2 font-medium">Event</th><th className="pb-2 font-medium">To</th><th className="pb-2 font-medium">When</th><th className="pb-2 text-right font-medium">Tx</th></tr></thead>
                <tbody>
                  {l.transfers.map((t) => (
                    <tr key={t.txHash} className="border-t border-line">
                      <td className="py-2.5 capitalize">{t.type}</td>
                      <td className="py-2.5 font-mono text-[12px] text-bodytext">{t.to ? `${t.to.slice(0, 6)}…${t.to.slice(-4)}` : "—"}</td>
                      <td className="py-2.5 text-[12px] text-muted">{new Date(t.ts * 1000).toISOString().slice(0, 10)}</td>
                      <td className="py-2.5 text-right"><a href={`https://bscscan.com/tx/${t.txHash}`} target="_blank" rel="noreferrer" className="font-semibold text-violet hover:underline">↗</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* why this matters */}
        <div className="mt-5 rounded-3xl bg-grad-panel p-7 text-white">
          <div className="text-sm font-semibold uppercase tracking-wide text-faint-violet">Why this matters for pack EV</div>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed">{impact}</p>
          <Link href="/app#packs" className="mt-4 inline-block rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/25">See pack EV →</Link>
        </div>
      </div>
      <DetailFooter />
    </main>
  );
}

function Bar({ label, value, width, color }: { label: string; value: string; width: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-[13px]"><span className="text-bodytext">{label}</span><span className="font-display font-semibold tabular-nums">{value}</span></div>
      <div className="h-2.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full" style={{ width: `${Math.max(3, width)}%`, background: color }} /></div>
    </div>
  );
}
