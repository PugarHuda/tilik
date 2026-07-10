import Link from "next/link";
import { Wordmark } from "@/components/Logo";

export function DetailHeader({ crumb, title, back }: { crumb: string; title: string; back: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-app/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1000px] items-center justify-between px-6 py-3.5">
        <Link href="/">
          <Wordmark tileSize={28} textSize={20} />
        </Link>
        <div className="hidden text-[13px] text-muted sm:block">
          <Link href={back} className="hover:text-ink">
            {crumb}
          </Link>{" "}
          <span className="text-line2">/</span> <span className="font-medium text-ink">{title}</span>
        </div>
        <Link href={back} className="rounded-full border border-line2 bg-white px-3.5 py-1.5 text-sm font-medium text-bodytext hover:text-ink">
          ← App
        </Link>
      </div>
    </header>
  );
}

export function DetailFooter() {
  return (
    <footer className="mx-auto max-w-[1000px] px-6 py-10 text-center text-xs text-muted">
      Tilik — independent, not affiliated with Renaiss · estimates only, not financial advice.
    </footer>
  );
}
