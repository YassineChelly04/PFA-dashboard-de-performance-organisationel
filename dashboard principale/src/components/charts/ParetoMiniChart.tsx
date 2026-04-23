"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function ParetoMiniChart({
  data,
}: {
  data: { label: string; volume: number; cumPct: number }[];
}) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 18, left: 0, bottom: 10 }}>
          <CartesianGrid stroke="#EEF2F7" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#6B7280", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#E5E7EB" }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: "#6B7280", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#E5E7EB" }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tickFormatter={(v) => `${Math.round(v)}%`}
            tick={{ fill: "#6B7280", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#E5E7EB" }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              border: "1px solid #E5E7EB",
            }}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="volume"
            name="Volume"
            fill="#1E2F97"
            radius={[10, 10, 0, 0]}
            barSize={34}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumPct"
            name="% cumulé"
            stroke="#5F2EE5"
            strokeWidth={3}
            dot={false}
            strokeDasharray="6 6"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
