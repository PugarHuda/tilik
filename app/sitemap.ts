import type { MetadataRoute } from "next";
import packsData from "@/data/packs.json";
import scannerData from "@/data/scanner.json";
import type { Pack } from "@/lib/ev";
import type { Listing } from "@/lib/scanner";

const BASE = "https://tilikrip.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const packs = (packsData.packs as Pack[])
    .filter((p) => p.pulls.length)
    .map((p) => ({ url: `${BASE}/packs/${p.slug}`, priority: 0.8 }));
  const cards = (scannerData.listings as Listing[]).map((l) => ({
    url: `${BASE}/cards/${l.cert}`,
    priority: 0.6,
  }));
  return [
    { url: BASE, priority: 1 },
    { url: `${BASE}/app`, priority: 0.9 },
    ...packs,
    ...cards,
  ];
}
