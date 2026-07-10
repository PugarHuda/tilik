import type { Stats } from "@/lib/ev";

export const VERDICT: Record<Stats["verdict"], { label: string; color: string; bg: string }> = {
  positive: { label: "Leans +EV", color: "#16a34a", bg: "#ecfdf3" },
  "top-heavy": { label: "+EV but top-heavy", color: "#e9a50b", bg: "#fef8e7" },
  "roughly-fair": { label: "Roughly fair", color: "#6c3bf4", bg: "#f0ebff" },
  negative: { label: "Leans −EV", color: "#e23d53", bg: "#fef1f3" },
};
