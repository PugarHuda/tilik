# Tilik — 2-minute demo script

**Live:** https://tilikrip.vercel.app · **Repo:** https://github.com/PugarHuda/tilik

Tone: *ally, not antagonist.* Tilik helps collectors trust the pull — it doesn't accuse Renaiss.
Record at 1280×720, dark theme, one browser tab. Times are cumulative.

---

### 0:00 – 0:12 · Hook / the problem
> "Renaiss gacha packs show you one number — the top prize. Never the expected value, never the
> odds. If you're paying $48 to $150 a rip, you're flying blind. Tilik fixes that."

**On screen:** open `tilikrip.vercel.app`, scroll slowly past the three pack cards.

### 0:12 – 0:35 · Fairness cross-check (the core)
> "For every pack, Tilik cross-checks Renaiss' *own* stated expected value against the last 30 real
> pulls. OMEGA: they state $51.84; the observed mean was $48.83 — consistent. We show the 95%
> confidence interval too, because it's a small sample and we won't hide the noise."

**On screen:** OMEGA card — point to the cross-check line, the CI, the value histogram, P(profit).

### 0:35 – 0:52 · Honest verdicts
> "And we're honest about skew. Eden's *average* pull beats the rip — but 80% of pulls still lose.
> So it's not a green '+EV'. It's labeled '+EV but top-heavy.' The average alone flatters the odds."

**On screen:** scroll to Eden, point to the amber "+EV but top-heavy" badge and the P(profit)/median.

### 0:52 – 1:15 · Independent cross-check (the wedge)
> "Here's the part Renaiss can't credibly build themselves. Every FMV above is Renaiss valuing
> Renaiss. So we check it against an *independent*, sale-based estimate from the Renaiss OS Index.
> This card: Renaiss FMV forty dollars, independent estimate sixteen. We just flag it — you decide."

**On screen:** the Independent price cross-check section; hover a listing where FMV runs above index;
show the card art, the three prices, the band.

### 1:15 – 1:32 · On-chain + check any card
> "It's all verifiable. Each card links its real BNB Chain transfers to BscScan — that's what
> 'verifiable on-chain' actually looks like. And you can paste any PSA cert, or a photo of a slab,
> for an independent valuation on the spot."

**On screen:** expand "On-chain provenance", click one BscScan link (new tab, show it's real);
back to Tilik, click the `PSA82643863` example chip → result card with image + sparkline.

### 1:32 – 1:52 · Should I rip? simulator
> "Finally — should you rip? Monte Carlo, five thousand runs. Rip OMEGA ten times: here's your
> expected profit-and-loss, your chance of coming out ahead, and the full distribution."

**On screen:** the simulator — drag the rips slider, watch the P&L histogram and stats update.

### 1:52 – 2:00 · Close (the framing)
> "Transparent gacha doesn't hurt the house — like a casino publishing its RTP, it builds trust.
> Tilik gives Renaiss the credibility a first-party calculator never could. Know your rip."

**On screen:** scroll to the "How it works / limitations" section, then the Tilik header. End card.

---

**If something's rate-limited during recording:** the cert example chips resolve from cache instantly
— use those, not a fresh cert. The committed data snapshot means the whole demo works offline.
