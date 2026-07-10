import { ImageResponse } from "next/og";
import scannerData from "@/data/scanner.json";
import { listingSignals, type Listing } from "@/lib/scanner";
import { usd } from "@/lib/format";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const listings = () => scannerData.listings as Listing[];
export function generateStaticParams() {
  return listings().map((l) => ({ cert: l.cert }));
}

export default async function OG({ params }: { params: Promise<{ cert: string }> }) {
  const { cert } = await params;
  const l = listings().find((x) => x.cert.toUpperCase() === cert.toUpperCase());
  const sig = l ? listingSignals(l) : null;
  const band = sig?.fmvBand;
  const bandLabel =
    band === "above" ? "FMV above independent" : band === "below" ? "FMV below independent" : "FMV in line";
  const bandColor = band === "above" ? "#fca5a5" : band === "below" ? "#7ee0a0" : "#c9b6ff";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#12101a",
          color: "#fff",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 32, color: "#9a93ac", letterSpacing: 1 }}>
          Tilik · independent cross-check
        </div>
        <div style={{ display: "flex", fontSize: 56, fontWeight: 800, marginTop: 18, maxWidth: 1050 }}>
          {(l?.name ?? "Graded card").slice(0, 60)}
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "#9a93ac", marginTop: 12 }}>
          {l ? `${l.gradingCompany} ${l.grade} · ${l.cert}` : cert}
        </div>
        {l && (
          <div style={{ display: "flex", marginTop: 40, alignItems: "baseline" }}>
            <div style={{ display: "flex", fontSize: 40, color: "#6c3bf4", fontWeight: 700 }}>
              FMV {usd(l.renaissFmv)}
            </div>
            <div style={{ display: "flex", fontSize: 40, color: "#16a34a", fontWeight: 700, marginLeft: 40 }}>
              Independent {l.index ? usd(l.index.estimate) : "—"}
            </div>
          </div>
        )}
        <div style={{ display: "flex", marginTop: 36, fontSize: 40, fontWeight: 700, color: bandColor }}>
          {bandLabel}
        </div>
        <div style={{ display: "flex", marginTop: "auto", fontSize: 28, color: "#726b87" }}>
          Independent valuation via Renaiss OS Index · estimate, not a verified fact
        </div>
      </div>
    ),
    size,
  );
}
