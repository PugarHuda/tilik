import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#09090b",
          color: "#e4e4e7",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
          <div style={{ fontSize: 96, fontWeight: 800, color: "#fafafa" }}>Tilik</div>
          <div style={{ fontSize: 40, color: "#34d399" }}>know your rip</div>
        </div>
        <div style={{ fontSize: 40, color: "#a1a1aa", marginTop: 24, lineHeight: 1.35, maxWidth: 1000 }}>
          Independent EV, odds &amp; fairness cross-check for Renaiss gacha packs — before you rip.
        </div>
        <div style={{ fontSize: 28, color: "#52525b", marginTop: 40 }}>
          Renaiss FMV · independent index · on-chain provenance
        </div>
      </div>
    ),
    size,
  );
}
