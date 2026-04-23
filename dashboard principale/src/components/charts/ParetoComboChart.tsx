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

export type ParetoDatum = {
  label: string;
  volume: number;
  cumPct: number;
};

export function ParetoComboChart({
  data,
  showCumulative = true,
}: {
  data: ParetoDatum[];
  showCumulative?: boolean;
}) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#EEF2F7" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#6B7280", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#E5E7EB" }}
            interval={0}
            angle={-25}
            textAnchor="end"
            height={70}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: "#6B7280", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#E5E7EB" }}
          />
          {showCumulative ? (
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) => `${Math.round(v)}%`}
              domain={[0, 100]}
              tick={{ fill: "#6B7280", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
            />
          ) : null}
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
            name="Volume Réclamations (Abs)"
            fill="#1E2F97"
            radius={[10, 10, 0, 0]}
            barSize={34}
          />
          {showCumulative ? (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cumPct"
              name="% Cumulé"
              stroke="#5F2EE5"
              strokeWidth={3}
              dot={false}
              strokeDasharray="6 6"
            />
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
