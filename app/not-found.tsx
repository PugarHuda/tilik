import Link from "next/link";
import { Wordmark } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-app px-6 text-center text-ink">
      <Link href="/">
        <Wordmark tileSize={34} textSize={26} />
      </Link>
      <div className="mt-8 font-display text-[64px] font-bold leading-none text-violet">404</div>
      <p className="mt-3 max-w-sm text-[15px] text-bodytext">
        That pack or card isn&rsquo;t here — it may have rotated out of the pool, or the link is off.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/app#packs" className="rounded-xl bg-violet px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-mid">
          Check a pack
        </Link>
        <Link href="/" className="rounded-xl border border-line2 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-soft">
          Home
        </Link>
      </div>
    </main>
  );
}
