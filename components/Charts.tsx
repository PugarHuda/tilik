"use client";
import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { Bin } from "@/lib/ev";

const COLOR: Record<Bin["kind"], string> = {
  loss: "#fb7185", // rose — pull worth less than the rip price
  profit: "#34d399", // emerald — pull worth 1–2× the rip
  chase: "#fbbf24", // amber — the chase hits
};

export function ValueHistogram({ bins }: { bins: Bin[] }) {
  const total = bins.reduce((a, b) => a + b.count, 0);
  const label =
    `Histogram of ${total} pulls by value relative to rip price: ` +
    bins.map((b) => `${b.label} ${b.count}`).join(", ");
  return (
    <div role="img" aria-label={label}>
    <ResponsiveContainer width="100%" height={170}>
      <BarChart data={bins} margin={{ top: 8, right: 8, bottom: 0, left: -22 }}>
        <XAxis
          dataKey="label"
          tick={{ fill: "#a1a1aa", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: "#71717a", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={26}
        />
        <Tooltip
          cursor={{ fill: "#ffffff10" }}
          contentStyle={{
            background: "#18181b",
            border: "1px solid #3f3f46",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "#e4e4e7" }}
          formatter={(v: number) => [`${v} pulls`, "count"]}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {bins.map((b, i) => (
            <Cell key={i} fill={COLOR[b.kind]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
}
