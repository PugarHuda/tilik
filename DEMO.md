# Tilik — 2-minute demo script

**Live:** https://tilikrip.vercel.app · **Repo:** https://github.com/PugarHuda/tilik

Tone: *ally, not antagonist.* Tilik helps collectors trust the pull. Record 1280×720, light theme.
Flow: marketing landing (`/`) → app dashboard (`/app`, four views) → a detail page. Times cumulative.

---

### 0:00 – 0:14 · Landing hero
> "Renaiss gacha packs show you one number — the top prize. Never the EV, never the odds. Tilik shows
> the realistic expected value and an honest verdict, before you rip."

**On screen:** open `tilikrip.vercel.app`. The hero, the fanned gacha cards, the floating "P(pull > rip)"
and "Median pull" chips. Scroll past "Ripping blind vs Ripping with Tilik."

### 0:14 – 0:34 · Pack cross-check (landing) → open the app
> "For each pack, Tilik cross-checks Renaiss' own stated EV against the last 30 real pulls, with a 95%
> confidence interval. Then it opens into the full app."

**On screen:** the pack dashboard section (violet EV card + histogram + odds). Click **"Check a Pack"** →
lands on `/app` (ink sidebar, Packs view).

### 0:34 – 0:52 · Honest verdicts (app · Packs)
> "It's honest about skew. OMEGA and Eden are 'top-heavy' — the average beats the rip, but most single
> pulls lose. RenaCrypt leans genuinely +EV. The verdict factors in P(profit), not just the mean."

**On screen:** click the pack pills (OMEGA → RenaCrypt → Eden). Point to the verdict pill changing
(amber "top-heavy" vs green "Leans +EV"), the median vs rip, P(profit).

### 0:52 – 1:12 · Independent cross-check + photo ID (app · Scanner)
> "The credibility layer: every FMV is Renaiss valuing Renaiss, so we check it against an independent,
> sale-based estimate from the Renaiss OS Index. You can paste any cert — or snap a photo of the slab."

**On screen:** Scanner view. Click a cert chip → Ask / FMV / Independent bars + band. Then use
**"📸 identify from a photo"** — upload a slab photo → it resolves to the card + independent estimate.

### 1:12 – 1:30 · On-chain (app · On-chain)
> "It's all verifiable — each card's real BNB Chain events, mint to sell, linked to BscScan. That's what
> 'verifiable on-chain' actually looks like."

**On screen:** On-chain view — the events table; click a Tx ↗ (opens BscScan in a new tab, show it's real).

### 1:30 – 1:50 · Should I rip? (app · Simulator)
> "And the fun one — Monte Carlo. Rip a pack N times: your chance of finishing up, expected P&L, and the
> full distribution with a break-even line."

**On screen:** Simulator view — drag the rips slider (1–15); the stats and P&L bars recompute live.

### 1:50 – 2:00 · Close
> "Transparent gacha doesn't hurt the house — like a casino publishing its RTP, it builds trust. Tilik
> gives Renaiss the credibility a first-party calculator never could. Know your rip."

**On screen:** open a pack detail page (`View full breakdown →`) for the last-30-pulls grid, then the
Tilik wordmark. End card.

---

**Robustness:** cert **chips** and the two example lookups resolve from cache instantly — safe even if
the Index is rate-limited. The committed snapshot means the whole demo works offline.
