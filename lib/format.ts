export const usd = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// whole-dollar (no cents) — matches the design's fmt0 for large figures
export const usd0 = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

export const pct = (n: number) => (n * 100).toFixed(0) + "%";

export const ratio = (n: number) => n.toFixed(2) + "×";

export function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const units: [number, string][] = [
    [86400, "d"],
    [3600, "h"],
    [60, "m"],
  ];
  for (const [sec, label] of units) if (s >= sec) return Math.floor(s / sec) + label + " ago";
  return "just now";
}
