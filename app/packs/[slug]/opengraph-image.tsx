import { ImageResponse } from "next/og";
import packsData from "@/data/packs.json";
import { packStats, type Pack } from "@/lib/ev";
import { VERDICT } from "@/components/verdict";
import { usd, usd0, pct } from "@/lib/format";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const packs = () => (packsData.packs as Pack[]).filter((p) => p.pulls.length);
export function generateStaticParams() {
  return packs().map((p) => ({ slug: p.slug }));
}

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pack = packs().find((p) => p.slug === slug);
  const s = pack ? packStats(pack) : null;
  const v = s ? VERDICT[s.verdict] : null;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(140deg, #6c3bf4, #3d1596)",
          color: "#fff",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 32, color: "#c9b6ff", letterSpacing: 1 }}>
          Tilik · pack transparency
        </div>
        <div style={{ display: "flex", fontSize: 92, fontWeight: 800, marginTop: 18 }}>
          {pack?.name ?? "Pack"}
        </div>
        {s && (
          <div style={{ display: "flex", fontSize: 40, color: "#c9b6ff", marginTop: 10 }}>
            Observed EV {usd(s.empiricalMean)} · rip {usd0(s.ripPrice)} · P(profit) {pct(s.pProfit)}
          </div>
        )}
        {v && (
          <div style={{ display: "flex", marginTop: 44 }}>
            <div
              style={{
                display: "flex",
                background: v.bg,
                color: v.color,
                padding: "14px 32px",
                borderRadius: 999,
                fontSize: 40,
                fontWeight: 700,
              }}
            >
              {v.label}
            </div>
          </div>
        )}
        <div style={{ display: "flex", marginTop: "auto", fontSize: 28, color: "#b7afd0" }}>
          know your rip · independent estimate, not financial advice
        </div>
      </div>
    ),
    size,
  );
}
