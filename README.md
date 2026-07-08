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
- **Observed odds by tier** (A/B/C: frequency + average value), and links to the real cards.

## Data source, assumptions, limitations

- **Source:** the official Renaiss CLI (`npx renaiss`, beta, read-only) — rip price, stated EV,
  featured top card, and the last 30 pulls (tier + FMV). No scraping, no wallet, no private data.
- **Assumption:** EV/odds are **empirical** — computed from the last 30 observed pulls, not from
  true draw probabilities (Renaiss doesn't publish those). It's a small sample, not a guarantee.
- **Units:** USD fields are normalized from cents; rip price from USDT wei.
- **Beta caveat:** Renaiss CLI data may be incomplete, delayed, or updated. Treat every number as
  an experimental reference, **not a verified market fact**. The committed snapshot in
  `data/packs.json` is what the deployed site renders, so the demo works even if the CLI is down.

## Architecture

```
scripts/fetch.mjs   → snapshot the CLI into data/packs.json (run manually to refresh)
data/packs.json     → committed snapshot; the site never calls the CLI at build time
lib/ev.ts           → pure EV/odds engine + self-check (`npm run check`)
app/ + components/  → Next.js (App Router, fully static) dashboard, Recharts histogram
```

No database, no cron, no indexer — total data is ~90 rows across 3 packs.

## Run it

```bash
npm install
npm run check      # ev engine self-check
npm run snapshot   # refresh data/packs.json from the live CLI (optional)
npm run dev        # http://localhost:3000
npm run build      # static production build → deploy to Vercel
```

---

*Tilik is independent and not affiliated with Renaiss. All figures are labeled estimates.*
