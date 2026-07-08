# Tilik — *know your rip*

An independent EV & odds-transparency tool for **Renaiss** gacha card packs.

**Live demo:** https://tilikrip.vercel.app
**Repo:** https://github.com/PugarHuda/tilik

Renaiss sells "infinite gacha" packs of real graded Pokémon / One Piece cards and
advertises only the **top prize** — never the expected value or the odds. A collector
paying $48–$150 per rip is flying blind. Tilik shows the realistic EV, the distribution
of what people actually pull, and a **fairness cross-check** against Renaiss' own stated
EV — so you can *inspect before you rip*.

## The wedge

Renaiss structurally can't ship an honest EV calculator for its own packs (it sells them).
A neutral third-party tool has the credibility Renaiss itself lacks. Transparent gacha
doesn't hurt the seller — like a casino publishing slot RTP, it builds trust. Tilik is
**decision-support for collectors, not a watchdog**: it surfaces the numbers and their
assumptions and lets you decide.

## What it shows (per pack: OMEGA, RenaCrypt, Eden)

- **Fairness cross-check** — Renaiss' stated EV vs. the realized mean of the last 30 real pulls.
- **Verdict badge** — leans +EV / roughly fair / leans −EV (based on observed mean ÷ rip).
- **Value distribution** — histogram of the last 30 pulls binned by multiple of the rip price
  (loss / profit / chase).
- **P(pull > rip)** and **median** alongside the mean — because gacha value is skewed, the
  mean can beat the rip while most individual pulls still lose.
- **Observed odds by tier** (A/B/C: frequency + average value).

## Independent price cross-check (the credibility layer)

Every EV number above is built on Renaiss' *own* FMV — a circular source. Tilik cross-checks that
FMV against an **independent, sale-based estimate** from the [Renaiss OS Index](https://index.renaissos.com)
(`api.renaissos.com/v1/graded/{cert}`): last-sale price, trend, confidence tier, and PSA population.

- **Value scanner** — for live marketplace listings: Ask vs Renaiss FMV vs independent estimate,
  with a neutral band (above / in line / below). Where FMV runs well above the independent estimate,
  a pack EV built on it may be optimistic.
- **Check any graded card** — paste a PSA / CGC / BGS cert for an on-demand independent valuation.

Real example found in the data: cert `PSA82643863` — Renaiss FMV **$40.00**, ask **$102.00**,
independent estimate **$16.62** (last sale 2026-06-17, trending −18.7%).

**Monte Carlo "Should I rip?"** simulator rounds it out: rip N times and see the P&L distribution,
bootstrapped from the observed pulls.

## Data source, assumptions, limitations

- **Sources:** (1) the official Renaiss CLI (`npx renaiss`, beta, read-only) — rip price, stated EV,
  featured top card, last 30 pulls (tier + FMV), and marketplace listings; (2) the Renaiss OS Index
  API (`api.renaissos.com`, beta) — independent sale-based valuations by grading cert. No scraping,
  no wallet, no private data. **Attribution:** independent valuations are credited to Renaiss OS Index.
- **Rate limits:** the Index public tier is 10 requests/day/IP, so cross-check data is a curated,
  cached sample (`data/scanner.json`); the example certs resolve from cache. Set `RENAISS_API_KEY` /
  `RENAISS_API_SECRET` for the partner tier (10k/day) to widen live coverage.
- **Pool rotation:** packs are perpetual — cards rotate in/out, so an individual past pull may no
  longer be in the pool (its card page can 404). Pull lists are labeled as historical snapshots.
- **Assumption:** EV/odds are **empirical** — computed from the last 30 observed pulls, not from
  true draw probabilities (Renaiss doesn't publish those). It's a small sample, not a guarantee.
- **Units:** USD fields are normalized from cents; rip price from USDT wei.
- **Beta caveat:** Renaiss CLI data may be incomplete, delayed, or updated. Treat every number as
  an experimental reference, **not a verified market fact**. The committed snapshot in
  `data/packs.json` is what the deployed site renders, so the demo works even if the CLI is down.

## Architecture

```
scripts/fetch.mjs        → snapshot packs from the CLI into data/packs.json
scripts/scan.mjs         → enrich marketplace listings with Index valuations → data/scanner.json
data/*.json              → committed snapshots; the site never calls the CLI at build time
lib/ev.ts                → pure EV/odds + Monte Carlo engine + self-check
lib/scanner.ts           → pure cross-check (band) logic + self-check
app/api/cert/[cert]      → serverless proxy to the Index API (cache-first, rate-limit aware)
app/ + components/       → Next.js (App Router) dashboard, Recharts
```

No database, no cron, no indexer — total data is ~90 pulls + a curated cross-check sample.

## Run it

```bash
npm install
npm run check      # ev + scanner engine self-checks
npm run snapshot   # refresh data/packs.json from the live CLI (optional)
npm run scan       # refresh data/scanner.json (Index cross-check; uses ~6 API calls)
npm run dev        # http://localhost:3000
npm run build      # production build → deploy to Vercel
```

---

*Tilik is independent and not affiliated with Renaiss. All figures are labeled estimates.*
