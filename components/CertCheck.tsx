"use client";
import { useState } from "react";
import { usd } from "@/lib/format";

type Result = {
  cert: string;
  found: boolean;
  cached?: boolean;
  error?: string;
  card?: { name: string; setName: string; grade: string; gradingCompany: string; imageUrl: string | null };
  index?: {
    estimate: number | null;
    deltaPct: number | null;
    confidence: string | null;
    lastSaleAt: string | null;
    population: number | null;
    href: string | null;
  };
};

const EXAMPLES = ["PSA82643863", "PSA151238633"];

export default function CertCheck() {
  const [cert, setCert] = useState("");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<Result | null>(null);

  async function lookup(value: string) {
    const c = value.trim().toUpperCase();
    if (!c) return;
    setCert(c);
    setLoading(true);
    setRes(null);
    try {
      const r = await fetch(`/api/cert/${encodeURIComponent(c)}`);
      setRes(await r.json());
    } catch {
      setRes({ cert: c, found: false, error: "Network error." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl bg-zinc-900/70 p-5 ring-1 ring-white/10 sm:p-6">
      <h2 className="text-xl font-bold text-zinc-50">Check any graded card</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Paste a PSA / CGC / BGS cert number for an independent, sale-based valuation from the Renaiss
        OS Index — the same source we cross-check pack FMVs against.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          lookup(cert);
        }}
        className="mt-4 flex gap-2"
      >
        <input
          value={cert}
          onChange={(e) => setCert(e.target.value)}
          placeholder="e.g. PSA82643863"
          className="min-w-0 flex-1 rounded-lg bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 ring-1 ring-white/10 outline-none placeholder:text-zinc-600 focus:ring-emerald-500/40"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-200 ring-1 ring-emerald-500/40 transition hover:bg-emerald-500/30 disabled:opacity-50"
        >
          {loading ? "…" : "Check"}
        </button>
      </form>

      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-zinc-500">
        <span>try:</span>
        {EXAMPLES.map((ex) => (
          <button key={ex} onClick={() => lookup(ex)} className="underline hover:text-zinc-300">
            {ex}
          </button>
        ))}
      </div>

      {res && (
        <div className="mt-4 rounded-xl bg-zinc-800/40 p-4 ring-1 ring-white/5">
          {res.found && res.index ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {res.card?.imageUrl && (
                    <img
                      src={res.card.imageUrl}
                      alt={res.card?.name ?? "card"}
                      loading="lazy"
                      className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-white/10"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-zinc-100">{res.card?.name}</div>
                    <div className="text-[11px] text-zinc-500">
                      {res.card?.setName} · {res.card?.gradingCompany} {res.card?.grade} · {res.cert}
                    </div>
                  </div>
                </div>
                {res.cached && (
                  <span className="shrink-0 rounded-full bg-zinc-700/40 px-2 py-0.5 text-[10px] text-zinc-400">
                    cached
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-zinc-50 tabular-nums">
                  {res.index.estimate != null ? usd(res.index.estimate) : "—"}
                </span>
                <span className="text-xs text-zinc-500">independent estimate</span>
                {res.index.deltaPct != null && (
                  <span className={`text-xs ${res.index.deltaPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {res.index.deltaPct >= 0 ? "▲" : "▼"} {Math.abs(res.index.deltaPct).toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-zinc-500">
                {res.index.confidence && <span>confidence: {res.index.confidence}</span>}
                {res.index.population != null && <span>PSA pop {res.index.population}</span>}
                {res.index.lastSaleAt && <span>last sale {res.index.lastSaleAt.slice(0, 10)}</span>}
                {res.index.href && (
                  <a href={res.index.href} target="_blank" rel="noreferrer" className="hover:text-emerald-300">
                    view on Index ↗
                  </a>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-400">{res.error ?? "No record found for that cert."}</p>
          )}
        </div>
      )}
      <p className="mt-3 text-[11px] text-zinc-600">
        Independent valuations via{" "}
        <a href="https://index.renaissos.com" target="_blank" rel="noreferrer" className="underline hover:text-zinc-400">
          Renaiss OS Index
        </a>{" "}
        · public tier is rate-limited (10/day); cached examples always resolve.
      </p>
    </section>
  );
}
