import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tilik — know your rip",
  description:
    "Independent EV & odds transparency for Renaiss gacha packs. See the realistic expected value, observed pull distribution, and a fairness cross-check before you rip.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
