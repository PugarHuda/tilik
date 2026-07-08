# Tilik — HackS1 submission (Tool track)

> **Tilik — know your rip.** An independent EV, odds & fairness-transparency tool for Renaiss gacha packs.

- **Live demo:** https://tilikrip.vercel.app
- **Repo:** https://github.com/PugarHuda/tilik
- **Demo video:** _(see [DEMO.md](./DEMO.md) for the 2-minute script)_

---

## Problem
Renaiss gacha packs advertise only the **top prize** — never the expected value or the odds. A
collector paying **$48–$150** per rip has no way to judge whether a pack is worth it. And Renaiss
structurally *can't* ship an honest EV calculator for packs it sells — the conflict of interest kills
its credibility. That's the gap a neutral third party fills.

## Solution
Tilik turns the data Renaiss already exposes into a decision-support tool a collector can use in ten
seconds — **before** they rip:

1. **Fairness cross-check** — Renaiss' *stated* EV vs. the realized mean of the last 30 real pulls,
   with a 95% confidence interval.
2. **Honest verdict** — +EV / roughly-fair / **+EV-but-top-heavy** / −EV, factoring in P(profit), so
   a pack where the average wins but most pulls lose isn't dressed up as a plain "+EV".
3. **Value distribution + tier odds** — histogram by multiple of rip price; observed A/B/C frequencies.
4. **Independent price cross-check** — the credibility layer: marketplace FMV vs. an independent,
   sale-based estimate from the **Renaiss OS Index**, with card art and a price sparkline.
5. **On-chain provenance** — each card's real BNB Chain transfers linked to BscScan.
6. **Check any graded card** — paste a PSA/CGC/BGS cert (or a slab photo) for an independent valuation.
7. **"Should I rip?" Monte Carlo** — 5,000-run P&L distribution for N rips.

## Data sources
- **Renaiss CLI** (`npx renaiss`, beta, read-only) — pack rip price, stated EV, featured card, last 30
  pulls (tier + FMV), marketplace listings, and per-card on-chain activity.
- **Renaiss OS Index API** (`api.renaissos.com`, beta) — independent sale-based valuation by grading
  cert and by image. Attributed on every number it produces.
- No scraping, no wallet connection, no private data, no secrets in the repo.

## Assumptions (labeled everywhere in the UI)
- EV/odds are **empirical** — computed from the last 30 observed pulls, **not** the true draw
  probabilities (Renaiss doesn't publish those). Small sample → we show the confidence interval.
- USD fields normalized from cents; rip price from USDT wei.

## Limitations (stated up front — Safety over spin)
- **Pack-level independent proof is out of reach.** Pack pulls don't expose a cert, and the pool is
  perpetual so pulled cards rotate out and can't be looked up (verified: 0/15 sampled pull tokens
  resolved). The independent cross-check therefore runs on **marketplace listings**, and speaks to
  Renaiss' FMV methodology generally — not to one specific pack.
- **Index public tier is rate-limited** (10/day/IP). Cross-check data is a curated, cached sample; the
  cert examples always resolve from cache. Photo-identify (`by-image`) is beta and AI-slow — reliable
  only with a partner key (`RENAISS_API_KEY` / `RENAISS_API_SECRET`, already wired).
- All data is beta and may be incomplete, delayed, or updated. **Estimates, not verified market facts.
  Not financial advice.**

## Positioning
Pro-collector and pro-ecosystem. Transparent gacha doesn't hurt the seller — like a casino publishing
its RTP, it builds trust and retention. Tilik never calls a pack a "scam"; it surfaces the numbers and
their assumptions and lets the collector decide. It gives Renaiss the third-party credibility a
first-party calculator never could.

## Tech
Next.js (App Router) · TypeScript · Tailwind · Recharts · deployed on Vercel. Pure, self-checked EV &
cross-check engines (`npm run check`). No database, no cron beyond a rate-limit-safe daily snapshot
Action — total data is ~90 pulls plus a curated cross-check sample.

---

## Judging-criteria map
| Criterion | How Tilik scores |
|---|---|
| **Usability #1** | Zero-setup live URL, no wallet; card art, sparklines, interactive simulator, mobile-responsive, per-pack permalinks |
| **Innovation** | Cross-source valuation (Renaiss FMV vs independent index), on-chain provenance, photo-identify, EV confidence intervals |
| **Ecosystem** | Uses both the Renaiss CLI *and* Index API; substantiates the "verifiable on-chain" claim; increases trust in the packs |
| **Clarity** | Every number carries source + assumption + timestamp; a dedicated "how it works & limitations" section |
| **Safety** | Estimates labeled, never presented as fact; neutral non-accusatory copy; honest verdicts; limitations stated up front; no secrets/private data |

## Submission checklist
- [x] Live, clickable public URL (no setup for judges)
- [x] Working demo, not slides
- [x] Clear collector use case stated up front
- [x] Data sources, assumptions, limitations documented visibly
- [x] No private data / no secrets / no unsafe auth
- [x] Estimates labeled as estimates, never as verified fact
- [x] Public repo, clean commit history
- [x] README with problem → solution → sources → limitations → live link
- [ ] Demo video recorded & linked _(script ready in DEMO.md)_
