import { listingSignals, type Listing, type Band } from "@/lib/scanner";
import { usd, ratio } from "@/lib/format";

const BAND_CLS: Record<Band, string> = {
  above: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  below: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  "in-line": "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  unknown: "bg-zinc-500/15 text-zinc-400 ring-zinc-500/30",
};

function fmvPhrase(band: Band, r: number | null) {
  if (band === "unknown" || r == null) return "no independent record";
  if (band === "in-line") return "FMV in line with independent estimate";
  return `FMV is ${ratio(r)} the independent estimate`;
}

function PriceCell({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</div>
      <div className={`truncate text-sm font-semibold tabular-nums ${accent ?? "text-zinc-100"}`}>
        {value}
      </div>
    </div>
  );
}

function Row({ l }: { l: Listing }) {
  const s = listingSignals(l);
  const trend = l.index?.deltaPct;
  return (
    <li className="rounded-xl bg-zinc-800/30 p-4 ring-1 ring-white/5">
      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {l.image && (
          <img
            src={l.image}
            alt={l.name}
            loading="lazy"
            className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-white/10"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-zinc-100">{l.name}</div>
          <div className="text-[11px] text-zinc-500">
            {l.gradingCompany} {l.grade} · {l.cert}
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${BAND_CLS[s.fmvBand]}`}>
          {fmvPhrase(s.fmvBand, s.fmvVsIndex)}
        </span>
      </div>

      <div className="mt-3 flex items-end gap-3">
        <PriceCell label="Ask" value={s.askListed ? usd(l.ask) : "—"} />
        <PriceCell label="Renaiss FMV" value={usd(l.renaissFmv)} />
        <PriceCell
          label="Independent est."
          value={l.index ? usd(l.index.estimate) : "—"}
          accent="text-zinc-100"
        />
      </div>

      {l.index && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
          {trend != null && (
            <span className={trend >= 0 ? "text-emerald-400" : "text-rose-400"}>
              {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}%
            </span>
          )}
          {l.index.confidence && <span>confidence: {l.index.confidence}</span>}
          {l.index.population != null && <span>PSA pop {l.index.population}</span>}
          {l.index.lastSaleAt && <span>last sale {l.index.lastSaleAt.slice(0, 10)}</span>}
          <a href={l.renaissHref} target="_blank" rel="noreferrer" className="hover:text-zinc-300">
            Renaiss ↗
          </a>
          {l.index.href && (
            <a href={l.index.href} target="_blank" rel="noreferrer" className="hover:text-emerald-300">
              Index ↗
            </a>
          )}
        </div>
      )}

      {l.transfers.length > 0 && (
        <details className="mt-2 text-[11px] text-zinc-500">
          <summary className="cursor-pointer select-none hover:text-zinc-300">
            On-chain provenance ({l.transfers.length} transfers) — verify on BscScan
          </summary>
          <ul className="mt-1 space-y-0.5">
            {l.transfers.map((t) => (
              <li key={t.txHash} className="flex items-center justify-between gap-2 tabular-nums">
                <a
                  href={`https://bscscan.com/tx/${t.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate font-mono text-zinc-500 hover:text-emerald-300"
                >
                  {t.type} · {t.txHash.slice(0, 14)}…
                </a>
                {t.to && (
                  <span className="shrink-0 text-zinc-600">
                    → {t.to.slice(0, 6)}…{t.to.slice(-4)}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-zinc-600">
            BNB Chain transfer events — the on-chain record behind Renaiss&rsquo; &ldquo;verifiable on-chain&rdquo; claim.
          </p>
        </details>
      )}
    </li>
  );
}

export default function Scanner({ data }: { data: { listings: Listing[]; generatedAt: string } }) {
  return (
    <section className="rounded-2xl bg-zinc-900/70 p-5 ring-1 ring-white/10 sm:p-6">
      <h2 className="text-xl font-bold text-zinc-50">Independent price cross-check</h2>
      <p className="mt-1 text-sm leading-relaxed text-zinc-400">
        Every EV figure above uses Renaiss&rsquo; own FMV. Here we check that FMV against an{" "}
        <span className="text-zinc-200">independent, sale-based estimate</span> from the Renaiss OS
        Index — the same number, three ways. Where FMV runs well above the independent estimate, an
        advertised pack EV built on it may be optimistic. Neutral signal — you decide.
      </p>
      <ul className="mt-4 space-y-3">
        {data.listings.map((l) => (
          <Row key={l.tokenId} l={l} />
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-zinc-600">
        Independent valuations via{" "}
        <a href="https://index.renaissos.com" target="_blank" rel="noreferrer" className="underline hover:text-zinc-400">
          Renaiss OS Index
        </a>{" "}
        (beta) · a curated sample, cached to respect API rate limits · estimates, not verified facts.
      </p>
    </section>
  );
}
