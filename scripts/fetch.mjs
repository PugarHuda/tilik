// Snapshots live Renaiss pack data into data/packs.json via the official CLI.
// Run manually to refresh: `node scripts/fetch.mjs`. The committed JSON is the
// source of truth for the deployed site — we never call the CLI at build time.
// ponytail: no DB/indexer/cron. Total data is ~60 rows; a snapshot is enough.
// Add incremental pull history only when the luck leaderboard needs it.
import { execSync } from "node:child_process";
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, "data", "packs.json");

// The CLI prints an ASCII banner before the JSON; grab from the first brace.
function cli(args) {
  const raw = execSync(`npx --yes renaiss ${args}`, {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  const i = raw.indexOf("{");
  const j = raw.indexOf("[") >= 0 && raw.indexOf("[") < i ? raw.indexOf("[") : i;
  return JSON.parse(raw.slice(j));
}

const cents = (v) => (v == null ? null : Number(v) / 100);
const usdt = (v) => (v == null ? null : Number(v) / 1e18);

function normalize(p) {
  return {
    slug: p.slug,
    name: p.name,
    packType: p.packType,
    stage: p.stage,
    author: p.author,
    description: p.description,
    ripPrice: usdt(p.priceInUsdt),
    officialEV: cents(p.expectedValueInUsd),
    featuredCardFmv: cents(p.featuredCardFmvInUsd),
    pulls: (p.recentOpenedPacks ?? []).map((x) => ({
      tokenId: x.collectibleTokenId,
      tier: x.tier,
      fmv: cents(x.fmv),
      pulledAt: new Date(Number(x.pulledAtTimestamp) * 1000).toISOString(),
    })),
  };
}

function firstArray(obj) {
  for (const k of Object.keys(obj)) if (Array.isArray(obj[k])) return obj[k];
  return [];
}

try {
  const list = firstArray(cli("packs --json"));
  const packs = list.map((p) => normalize(cli(`packs ${p.slug} --json`).cardPack));
  const snapshot = {
    generatedAt: new Date().toISOString(),
    source: "Renaiss CLI (npx renaiss) — beta, read-only",
    note: "USD values normalized from cents; ripPrice from USDT wei. Treat as experimental references, not verified market facts.",
    packs,
  };
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(snapshot, null, 2) + "\n");
  console.log(`Wrote ${packs.length} packs to ${OUT}`);
  for (const p of packs) console.log(`  ${p.name}: rip $${p.ripPrice}, ${p.pulls.length} pulls`);
} catch (e) {
  console.error("Fetch failed:", e.message);
  try {
    JSON.parse(readFileSync(OUT, "utf8"));
    console.error("Keeping existing committed snapshot.");
  } catch {
    console.error("No valid snapshot exists — cannot continue.");
    process.exit(1);
  }
}
