import data from "@/data/packs.json";
import { type Pack } from "@/lib/ev";
import scannerData from "@/data/scanner.json";
import PackCard from "@/components/PackCard";
import Simulator, { type SimPack } from "@/components/Simulator";
import Scanner from "@/components/Scanner";
import CertCheck from "@/components/CertCheck";
import { type Listing } from "@/lib/scanner";
import { timeAgo } from "@/lib/format";

export default function Home() {
  const packs = (data.packs as Pack[])
    .filter((p) => p.pulls.length > 0)
    .sort((a, b) => a.ripPrice - b.ripPrice);

  const simPacks: SimPack[] = packs.map((p) => ({
    slug: p.slug,
    name: p.name,
    ripPrice: p.ripPrice,
    fmvs: p.pulls.map((x) => x.fmv),
  }));

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <header>
        <div className="flex items-baseline gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Tilik</h1>
          <span className="text-sm text-zinc-500">know your rip</span>
        </div>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-zinc-400">
          Renaiss gacha packs advertise only the top prize — never the expected value or the odds.
          Tilik is an independent tool that shows the realistic EV, the distribution of what people
          actually pull, and a fairness cross-check against Renaiss&rsquo; own stated EV — so you can{" "}
          <span className="text-zinc-200">inspect before you rip</span>.
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          Data: Renaiss CLI (beta) · snapshot {timeAgo(data.generatedAt)}. Every number below is a
          labeled estimate, not a verified market fact.
        </p>
      </header>

      <div className="mt-8 space-y-6">
        {packs.map((p) => (
          <PackCard key={p.slug} pack={p} updatedAt={data.generatedAt} />
        ))}
      </div>

      <div className="mt-6">
        <Scanner data={scannerData as { listings: Listing[]; generatedAt: string }} />
      </div>

      <div className="mt-6">
        <CertCheck />
      </div>

      <div className="mt-6">
        <Simulator packs={simPacks} />
      </div>

      <section className="mt-12 rounded-2xl bg-zinc-900/50 p-6 ring-1 ring-white/10">
        <h2 className="text-lg font-semibold text-zinc-100">How it works, and what it isn&rsquo;t</h2>
        <dl className="mt-4 space-y-4 text-sm leading-relaxed text-zinc-400">
          <div>
            <dt className="font-semibold text-zinc-200">Where the numbers come from</dt>
            <dd>
              We snapshot each pack from the official Renaiss CLI (<code>npx renaiss</code>): the rip
              price, Renaiss&rsquo; stated expected value, the featured top card, and the last 30
              real pulls (tier + fair-market value). No scraping, no wallet, no private data.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-zinc-200">How we compute EV & odds</dt>
            <dd>
              The <span className="text-zinc-300">observed mean</span> is the average FMV of the last
              30 pulls. <span className="text-zinc-300">P(pull &gt; rip)</span> and the tier
              frequencies are read straight off those same pulls. This is an{" "}
              <span className="text-zinc-300">empirical</span> estimate from a small sample — not a
              derivation of the true draw probabilities, which Renaiss does not publish.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-zinc-200">Why mean isn&rsquo;t the whole story</dt>
            <dd>
              Gacha value is skewed: a pack&rsquo;s mean can sit above the rip price while most
              individual pulls still come in below it. That&rsquo;s why we always show P(profit) and
              the median alongside the mean — the mean alone flatters the odds.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-zinc-200">What the cross-check can and can&rsquo;t reach</dt>
            <dd>
              The independent cross-check runs on <span className="text-zinc-300">marketplace listings</span>,
              which carry a grading cert. Pack pulls don&rsquo;t expose a cert, and because the pool is
              perpetual, a pulled card rotates out and can no longer be looked up — so we can&rsquo;t
              independently re-price the exact cards inside a pack. Read the cross-check as evidence
              about Renaiss&rsquo; FMV methodology generally, not proof about one specific pack.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-zinc-200">This is a decision-support tool, not a verdict</dt>
            <dd>
              A house edge is normal and expected in gacha — showing it is about trust, not
              accusation. Tilik surfaces the numbers and their assumptions; the decision to rip is
              yours. Renaiss CLI data is beta and may be incomplete, delayed, or updated.
            </dd>
          </div>
        </dl>
      </section>

      <footer className="mt-8 text-center text-xs leading-relaxed text-zinc-500">
        Tilik — an independent, pro-collector transparency tool. Not affiliated with, or endorsed by,
        Renaiss. All figures are labeled estimates from beta data — not verified market facts, and not
        financial advice.
      </footer>
    </main>
  );
}
