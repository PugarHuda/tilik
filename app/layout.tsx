import "./globals.css";
import type { Metadata } from "next";
import { Space_Grotesk, Instrument_Sans } from "next/font/google";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
const body = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tilikrip.vercel.app"),
  title: "Tilik — know your rip",
  description:
    "Independent EV, odds & fairness cross-check for Renaiss gacha packs — before you rip.",
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
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
