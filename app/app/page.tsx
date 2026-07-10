import packsData from "@/data/packs.json";
import scannerData from "@/data/scanner.json";
import cardsData from "@/data/cards.json";
import type { Pack } from "@/lib/ev";
import type { Listing } from "@/lib/scanner";
import AppShell, { type ChaseCard } from "@/components/app/AppShell";

export default function AppPage() {
  const packs = (packsData.packs as Pack[]).filter((p) => p.pulls.length).sort((a, b) => a.ripPrice - b.ripPrice);
  const listings = scannerData.listings as Listing[];
  const cards = cardsData.cards as ChaseCard[];
  return <AppShell packs={packs} listings={listings} cards={cards} />;
}
