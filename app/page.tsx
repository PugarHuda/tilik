import Link from "next/link";
import Image from "next/image";
import packsData from "@/data/packs.json";
import scannerData from "@/data/scanner.json";
import cardsData from "@/data/cards.json";
import { packStats, type Pack } from "@/lib/ev";
import { listingSignals, type Listing } from "@/lib/scanner";
import { usd, usd0, pct } from "@/lib/format";
import { Wordmark, Mark } from "@/components/Logo";
import { VERDICT } from "@/components/verdict";
import { Histogram, TierOdds } from "@/components/landing/Bars";

const NAV = [
  ["Packs", "#packs"],
  ["Scanner", "#scanner"],
  ["How it works", "#how"],
  ["FAQ", "#faq"],
];

export default function Landing() {
  const packs = (packsData.packs as Pack[]).filter((p) => p.pulls.length).sort((a, b) => a.ripPrice - b.ripPrice);
  const omega = packs[0];
  const s = packStats(omega);
  const v = VERDICT[s.verdict];

  const listing = (scannerData.listings as Listing[]).find((l) => l.cert === "PSA82643863") ?? (scannerData.listings as Listing[])[0];
  const sig = listingSignals(listing);
  const askMax = Math.max(listing.ask, listing.renaissFmv, listing.index?.estimate ?? 0);
  const cards = cardsData.cards as { image: string; pokemon?: string; name?: string }[];

  return (
    <main className="min-h-screen bg-white text-ink">
      {/* NAV */}
      <header className="sticky top-0 z-30 border-b border-line/60 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-3.5">
          <Wordmark tileSize={30} textSize={22} />
          <nav className="hidden items-center gap-1 rounded-full bg-navpill px-2 py-1.5 md:flex">
            {NAV.map(([label, href]) => (
              <a key={href} href={href} className="rounded-full px-3.5 py-1.5 text-sm font-medium text-bodytext transition hover:text-ink">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/app" className="hidden text-sm font-medium text-bodytext hover:text-ink sm:block">
              Open app
            </Link>
            <Link href="/app#packs" className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
              Check a Pack
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-[1180px] px-6 pb-8 pt-16 text-center sm:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-soft px-4 py-1.5 text-[12px] font-medium text-bodytext">
          <span className="h-1.5 w-1.5 rounded-full bg-violet" />
          INDEPENDENT · Not affiliated with Renaiss · estimates only
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-balance text-center text-[42px] font-bold leading-[1.03] tracking-[-1.5px] sm:text-[66px] sm:tracking-[-2px]">
          Know your rip <span className="text-violet">before</span> you rip
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-bodytext sm:text-lg">
          Renaiss gacha packs advertise only the top prize. Tilik shows the realistic expected value,
          the odds, and an honest verdict — cross-checked against independent data — so you can decide.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/app#packs" className="rounded-xl bg-violet px-6 py-3 text-[15px] font-semibold text-white shadow-[0_10px_26px_rgba(108,59,244,.4)] transition hover:bg-violet-mid">
            Check a Pack
          </Link>
          <Link href="/app#simulator" className="rounded-xl border border-line2 bg-white px-6 py-3 text-[15px] font-semibold text-ink transition hover:bg-soft">
            Open the app
          </Link>
        </div>

        {/* fanned cards — real graded card renders from Renaiss */}
        <div className="relative mx-auto mt-14 flex h-[300px] max-w-lg items-center justify-center sm:h-[380px]">
          <div className="floaty absolute h-[210px] w-[152px] -translate-x-24 -rotate-[11deg] overflow-hidden rounded-2xl bg-soft shadow-[0_26px_56px_rgba(59,25,140,.28)] ring-1 ring-black/5 sm:h-[268px] sm:w-[194px]" style={{ animationDelay: "-2s" }}>
            <Image src={cards[1].image} alt={cards[1].pokemon ?? "card"} fill sizes="194px" className="object-contain p-1" />
          </div>
          <div className="floaty absolute h-[210px] w-[152px] translate-x-24 rotate-[11deg] overflow-hidden rounded-2xl bg-soft shadow-[0_26px_56px_rgba(160,31,122,.28)] ring-1 ring-black/5 sm:h-[268px] sm:w-[194px]" style={{ animationDelay: "-4s" }}>
            <Image src={cards[2].image} alt={cards[2].pokemon ?? "card"} fill sizes="194px" className="object-contain p-1" />
          </div>
          <div className="floaty relative z-10 h-[230px] w-[168px] overflow-hidden rounded-2xl bg-ink shadow-[0_30px_60px_rgba(59,25,140,.34)] ring-1 ring-black/10 sm:h-[290px] sm:w-[212px]">
            <Image src={cards[0].image} alt={cards[0].pokemon ?? "featured card"} fill sizes="212px" className="object-contain p-1" priority />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent p-3 pt-8 text-left">
              <div className="text-[10px] font-medium uppercase tracking-wide text-faint-violet">Observed EV · {omega.name}</div>
              <div className="font-display text-2xl font-bold text-white">{usd(s.empiricalMean)}</div>
              <div className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: v.bg, color: v.color }}>
                {v.label}
              </div>
            </div>
          </div>
          <div className="absolute left-2 top-6 z-20 rounded-xl bg-white px-3 py-2 text-left shadow-lg sm:left-8">
            <div className="text-[10px] text-muted">P(pull &gt; rip)</div>
            <div className="font-display text-lg font-bold text-ink">{pct(s.pProfit)}</div>
          </div>
          <div className="absolute bottom-6 right-2 z-20 rounded-xl bg-ink px-3 py-2 text-left shadow-lg sm:right-8">
            <div className="text-[10px] text-faint">Median pull</div>
            <div className="font-display text-lg font-bold text-white">{usd0(s.median)}</div>
          </div>
        </div>
        <p className="mx-auto mt-4 max-w-md text-xs text-muted">
          *EV is built on Renaiss&rsquo; own FMV — Tilik cross-checks it against an independent index below.
        </p>
      </section>

      {/* TRUST STRIP */}
      <div className="border-y border-line bg-soft">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-4 text-[13px] font-medium text-muted font-display">
          <span>Renaiss CLI</span>·<span>Renaiss OS Index</span>·<span>BNB Chain</span>·<span>PSA / CGC / BGS</span>·<span>Monte Carlo</span>
        </div>
      </div>

      {/* COMPARISON */}
      <section className="mx-auto max-w-[1180px] px-6 py-16 sm:py-20">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-line bg-soft p-8">
            <div className="text-sm font-semibold uppercase tracking-wide text-loss">Ripping blind</div>
            <ul className="mt-4 space-y-3 text-[15px] text-bodytext">
              {["You see only the top prize", "No expected value, no odds", "No idea if you're +EV or −EV", "No independent price check"].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <span className="mt-0.5 text-loss">✕</span> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-grad-panel p-8 text-white shadow-[0_26px_56px_rgba(59,25,140,.3)]">
            <div className="text-sm font-semibold uppercase tracking-wide text-faint-violet">Ripping with Tilik</div>
            <ul className="mt-4 space-y-3 text-[15px]">
              {["Realistic EV from the last 30 pulls", "Odds by tier + P(profit) + median", "An honest verdict (mean and skew)", "Independent cross-check per card"].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <span className="mt-0.5 text-profit-light">✓</span> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* PACK DASHBOARD */}
      <section id="packs" className="mx-auto max-w-[1180px] scroll-mt-20 px-6 py-16 sm:py-20">
        <SectionHead eyebrow="Pack transparency" title="See the EV before you rip" />
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {/* cross-check card */}
          <div className="rounded-3xl bg-grad-panel p-7 text-white shadow-[0_26px_56px_rgba(59,25,140,.3)]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-white/10 ring-1 ring-white/15">
                  <Image src={cards[0].image} alt={cards[0].pokemon ?? "card"} fill sizes="44px" className="object-contain p-0.5" />
                </div>
                <span className="font-display text-lg font-semibold">{omega.name}</span>
              </div>
              <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: v.bg, color: v.color }}>
                {v.label}
              </span>
            </div>
            <div className="mt-6 text-[13px] text-faint-violet">Observed mean EV (last {s.n} pulls)</div>
            <div className="font-display text-[52px] font-bold leading-none">{usd(s.empiricalMean)}</div>
            <div className="mt-1 text-[13px] text-faint-violet">
              95% CI {usd0(s.meanCiLow)}–{usd0(s.meanCiHigh)} · Renaiss states {usd0(s.officialEV)}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                ["Rip price", usd0(s.ripPrice)],
                ["Median pull", usd0(s.median)],
                ["P(profit)", pct(s.pProfit)],
              ].map(([k, val]) => (
                <div key={k} className="rounded-xl bg-white/10 px-3 py-2.5">
                  <div className="text-[11px] text-faint-violet">{k}</div>
                  <div className="font-display text-lg font-bold">{val}</div>
                </div>
              ))}
            </div>
            <Link href={`/packs/${omega.slug}`} className="mt-6 inline-block rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/25">
              View full breakdown →
            </Link>
          </div>
          {/* histogram + odds */}
          <div className="rounded-3xl border border-line bg-white p-7 shadow-[0_20px_46px_rgba(30,20,70,.06)]">
            <div className="text-sm font-semibold text-ink">Value of the last {s.n} pulls <span className="text-muted">(× rip)</span></div>
            <div className="mt-4">
              <Histogram stats={s} />
            </div>
            <div className="mt-3 flex gap-4 text-[11px] text-muted">
              <Legend color="#e23d53" label="loss" />
              <Legend color="#16a34a" label="profit" />
              <Legend color="#e9a50b" label="chase" />
            </div>
            <div className="mt-6 text-sm font-semibold text-ink">Observed odds by tier</div>
            <div className="mt-3">
              <TierOdds stats={s} />
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {packs.map((p) => (
            <Link key={p.slug} href={`/packs/${p.slug}`} className="rounded-full border border-line2 bg-white px-4 py-2 text-sm font-semibold text-bodytext transition hover:border-violet hover:text-violet font-display">
              {p.name} · {usd0(p.ripPrice)}
            </Link>
          ))}
        </div>
      </section>

      {/* SCANNER */}
      <section id="scanner" className="scroll-mt-20 bg-app py-16 sm:py-20">
        <div className="mx-auto grid max-w-[1180px] items-center gap-8 px-6 lg:grid-cols-2">
          <div>
            <SectionHead eyebrow="Independent cross-check" title="Is that FMV even real?" left />
            <p className="mt-4 max-w-md text-[16px] leading-relaxed text-bodytext">
              Every pack EV is built on Renaiss&rsquo; own FMV. Tilik checks that FMV against an
              independent, sale-based estimate from the Renaiss OS Index — three price signals, you decide.
            </p>
            <ul className="mt-5 space-y-2.5 text-[15px] text-bodytext">
              {["Ask vs Renaiss FMV vs independent estimate", "On-chain provenance linked to BscScan", "Check any PSA / CGC / BGS cert — or a photo"].map((t) => (
                <li key={t} className="flex gap-2.5"><span className="mt-0.5 text-violet">→</span>{t}</li>
              ))}
            </ul>
            <Link href="/app#scanner" className="mt-6 inline-block rounded-xl bg-violet px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(108,59,244,.4)] transition hover:bg-violet-mid">
              Open the scanner →
            </Link>
          </div>
          <div className="rounded-3xl border border-line bg-white p-7 shadow-[0_20px_46px_rgba(30,20,70,.08)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-display text-base font-semibold text-ink">{listing.name.slice(0, 34)}…</div>
                <div className="text-xs text-muted">{listing.gradingCompany} {listing.grade} · {listing.cert}</div>
              </div>
              <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: sig.fmvBand === "above" ? "#fef1f3" : sig.fmvBand === "below" ? "#ecfdf3" : "#f0ebff", color: sig.fmvBand === "above" ? "#e23d53" : sig.fmvBand === "below" ? "#16a34a" : "#6c3bf4" }}>
                {sig.fmvBand === "above" ? "▲ FMV above independent" : sig.fmvBand === "below" ? "▼ FMV below independent" : "≈ FMV in line"}
              </span>
            </div>
            <div className="mt-5 space-y-3">
              <PriceBar label="Ask" value={usd(listing.ask)} width={(listing.ask / askMax) * 100} color="#e23d53" hide={!sig.askListed} />
              <PriceBar label="Renaiss FMV" value={usd(listing.renaissFmv)} width={(listing.renaissFmv / askMax) * 100} color="#6c3bf4" />
              <PriceBar label="Independent" value={listing.index ? usd(listing.index.estimate) : "—"} width={listing.index ? (listing.index.estimate / askMax) * 100 : 0} color="#16a34a" />
            </div>
            {listing.index && (
              <div className="mt-4 flex flex-wrap gap-x-3 text-[11px] text-muted">
                <span className={listing.index.deltaPct != null && listing.index.deltaPct >= 0 ? "text-profit" : "text-loss"}>
                  {listing.index.deltaPct != null ? `${listing.index.deltaPct >= 0 ? "▲" : "▼"} ${Math.abs(listing.index.deltaPct).toFixed(1)}%` : ""}
                </span>
                {listing.index.confidence && <span>confidence: {listing.index.confidence}</span>}
                {listing.index.population != null && <span>PSA pop {listing.index.population}</span>}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-[1180px] scroll-mt-20 px-6 py-16 sm:py-20">
        <SectionHead eyebrow="How it works" title="Two data sources, pure math" />
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {[
            ["Renaiss CLI", "Rip price, stated EV, featured card, the last 30 real pulls, and marketplace listings — read from the official CLI."],
            ["Renaiss OS Index", "Independent, sale-based valuations by grading cert (and by photo). Every number attributed."],
            ["Pure EV + Monte Carlo", "Empirical EV, odds, an honest verdict, and a bootstrap P&L simulator — all transparent, all labeled estimates."],
          ].map(([t, d], i) => (
            <div key={t} className="rounded-3xl border border-line bg-white p-7 shadow-[0_20px_46px_rgba(30,20,70,.05)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-grad-primary font-display text-lg font-bold text-white">{i + 1}</div>
              <div className="mt-4 font-display text-lg font-semibold text-ink">{t}</div>
              <p className="mt-2 text-[14px] leading-relaxed text-bodytext">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 bg-app py-16 sm:py-20">
        <div className="mx-auto max-w-[1180px] px-6">
          <SectionHead eyebrow="FAQ" title="Honest answers" />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {[
              ["Is this against Renaiss?", "No. Transparent gacha builds trust — like a casino publishing its RTP. Tilik is decision-support for collectors, not a watchdog."],
              ["Are these guaranteed odds?", "No. EV and odds are empirical estimates from a small sample (30 pulls) — not the true draw probabilities, which Renaiss doesn't publish."],
              ["Why is the average misleading?", "Gacha value is skewed: a pack's mean can beat the rip while most pulls still lose. That's why we show P(profit) and the median, and flag \"top-heavy.\""],
              ["Where do prices come from?", "The Renaiss CLI and the Renaiss OS Index (beta). Independent valuations are credited to the Index. All figures are estimates, not financial advice."],
            ].map(([q, a]) => (
              <div key={q} className="rounded-2xl border border-line bg-white p-6">
                <div className="font-display text-base font-semibold text-ink">{q}</div>
                <p className="mt-2 text-[14px] leading-relaxed text-bodytext">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIMITATIONS */}
      <section className="mx-auto max-w-[1180px] px-6 py-16">
        <div className="rounded-3xl bg-ink p-8 text-white sm:p-10">
          <div className="text-sm font-semibold uppercase tracking-wide text-gold">Limitations — read these</div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {[
              ["Small sample", "EV is from the last 30 pulls — a wide confidence interval, not a guarantee."],
              ["Rate limits", "The Index public tier is 10/day; cross-check data is a cached sample."],
              ["Pool rotation", "Packs are perpetual — pulled cards rotate out, so we can't re-price the exact cards inside a pack."],
              ["Beta data", "CLI + Index are beta and may be incomplete or delayed. Estimates, not verified facts. Not financial advice."],
            ].map(([t, d]) => (
              <div key={t}>
                <div className="font-display font-semibold text-white">{t}</div>
                <p className="mt-1 text-[14px] leading-relaxed text-faint">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-[1180px] px-6 pb-20">
        <div className="rounded-3xl bg-grad-primary p-10 text-center text-white shadow-[0_26px_56px_rgba(108,59,244,.3)]">
          <h2 className="text-[32px] font-bold tracking-[-1px] sm:text-[40px]">Inspect before you rip.</h2>
          <p className="mx-auto mt-3 max-w-md text-white/85">Open the tool, pick a pack, and see the numbers Renaiss doesn&rsquo;t show you.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/app#packs" className="rounded-xl bg-white px-6 py-3 text-[15px] font-semibold text-violet transition hover:bg-white/90">Check a Pack</Link>
            <Link href="/app#simulator" className="rounded-xl border border-white/40 px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-white/10">Should I rip?</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-6 py-10 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Wordmark tileSize={26} textSize={18} />
            <span className="text-xs text-muted">Independent · not affiliated with Renaiss · not financial advice</span>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-bodytext">
            <Link href="/app" className="hover:text-ink">App</Link>
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="https://index.renaissos.com" target="_blank" rel="noreferrer" className="hover:text-ink">OS Index</a>
          </div>
        </div>
        <div className="pb-8 text-center text-xs text-muted">© 2026 Tilik — estimates only.</div>
      </footer>
    </main>
  );
}

function SectionHead({ eyebrow, title, left }: { eyebrow: string; title: string; left?: boolean }) {
  return (
    <div className={left ? "" : "text-center"}>
      <div className="text-[12px] font-semibold uppercase tracking-[2px] text-pink font-display">{eyebrow}</div>
      <h2 className="mt-2 text-[30px] font-bold tracking-[-1px] text-ink sm:text-[40px]">{title}</h2>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function PriceBar({ label, value, width, color, hide }: { label: string; value: string; width: number; color: string; hide?: boolean }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-[13px]">
        <span className="text-bodytext">{label}</span>
        <span className="font-display font-semibold text-ink tabular-nums">{hide ? "—" : value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${hide ? 0 : Math.max(3, width)}%`, background: color }} />
      </div>
    </div>
  );
}
