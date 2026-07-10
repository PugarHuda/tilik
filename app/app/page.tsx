import packsData from "@/data/packs.json";
import scannerData from "@/data/scanner.json";
import type { Pack } from "@/lib/ev";
import type { Listing } from "@/lib/scanner";
import AppShell from "@/components/app/AppShell";

export default function AppPage() {
  const packs = (packsData.packs as Pack[]).filter((p) => p.pulls.length).sort((a, b) => a.ripPrice - b.ripPrice);
  const listings = scannerData.listings as Listing[];
  return <AppShell packs={packs} listings={listings} />;
}
