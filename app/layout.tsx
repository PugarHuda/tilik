import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tilik — know your rip",
  description:
    "Independent EV & odds transparency for Renaiss gacha packs. See the realistic expected value, observed pull distribution, and a fairness cross-check before you rip.",
  openGraph: {
    title: "Tilik — know your rip",
    description:
      "Independent EV, odds & fairness cross-check for Renaiss gacha packs — before you rip.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tilik — know your rip",
    description:
      "Independent EV, odds & fairness cross-check for Renaiss gacha packs — before you rip.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
