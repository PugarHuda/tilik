// Builds data/scanner.json: marketplace listings enriched with an INDEPENDENT,
// sale-based valuation from the Renaiss OS Index (api.renaissos.com). This is
// the cross-check Tilik is built on — Ask vs Renaiss FMV vs independent estimate.
//
// The Index public tier is rate-limited to 10 requests/day/IP, so we snapshot a
// small curated set and cache it. Set RENAISS_API_KEY / RENAISS_API_SECRET to use
// the partner tier (10k/day) and raise LIMIT.
// ponytail: no queue/retry infra — a handful of calls, cached to JSON. Add a
// partner key + higher LIMIT when we want live coverage of the whole market.
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, "data", "scanner.json");
const INDEX = "https://api.renaissos.com";
const LIMIT = Number(process.env.SCAN_LIMIT ?? 6); // keep under the 10/day public cap
const FETCH = 20; // marketplace rows to pull certs from

const cents = (v) => (v == null ? null : Number(v) / 100);
const usdt = (v) => (v == null ? null : Number(v) / 1e18);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function cli(args) {
  const raw = execSync(`npx --yes renaiss ${args}`, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  return JSON.parse(raw.slice(raw.indexOf("{")));
}

function certOf(item) {
  const s = (item.attributes ?? []).find((a) => /serial/i.test(a.trait));
  return s?.value ?? null; // e.g. "PSA82643863"
}

const key = process.env.RENAISS_API_KEY;
const secret = process.env.RENAISS_API_SECRET;

async function indexValuation(cert) {
  const headers = key && secret ? { "X-Api-Key": key, "X-Api-Secret": secret } : {};
  const res = await fetch(`${INDEX}/v1/graded/${cert}`, { headers });
  if (!res.ok) return { error: res.status === 429 ? "rate-limited" : `http ${res.status}` };
  const j = await res.json();
  if (!j.found || !j.card) return { error: "not-found" };
  const c = j.card;
  return {
    estimate: cents(c.priceUsdCents),
    deltaPct: c.deltaPct ?? null,
    confidence: c.confidence ?? null,
    lastSaleAt: c.lastSaleAt ?? null,
    spark: (c.spark ?? []).map((v) => v / 100),
    population: j.collectible?.rawLookup?.total_population ?? j.collectible?.totalPopulation ?? null,
    href: c.href ? `https://index.renaissos.com${c.href}` : null,
  };
}

const mkt = cli(`marketplace --listed --limit ${FETCH} --json`);
const rows = (Object.values(mkt).find((v) => Array.isArray(v)) ?? [])
  .map((it) => ({ it, cert: certOf(it) }))
  .filter((x) => x.cert)
  .slice(0, LIMIT);

const listings = [];
for (const { it, cert } of rows) {
  const index = await indexValuation(cert);
  listings.push({
    tokenId: it.tokenId,
    name: it.name,
    setName: it.setName,
    grade: it.grade,
    gradingCompany: it.gradingCompany,
    cert,
    ask: usdt(it.askPriceInUSDT),
    renaissFmv: cents(it.fmvPriceInUSD),
    index: index.error ? null : index,
    indexError: index.error ?? null,
    renaissHref: `https://www.renaiss.xyz/card/${it.tokenId}`,
  });
  console.log(`  ${cert}: ask $${listings.at(-1).ask} · fmv $${listings.at(-1).renaissFmv} · index ${index.error ? index.error : "$" + index.estimate}`);
  await sleep(400);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      source: "Renaiss CLI marketplace + Renaiss OS Index (api.renaissos.com)",
      attribution: "Independent valuations via Renaiss OS Index",
      tier: key ? "partner" : "public",
      listings,
    },
    null,
    2,
  ) + "\n",
);
console.log(`Wrote ${listings.length} enriched listings to ${OUT}`);
