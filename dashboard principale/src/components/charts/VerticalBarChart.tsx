"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function VerticalBarChart({
  data,
  averageY,
  averageLabel,
}: {
  data: { label: string; value: number }[];
  averageY: number;
  averageLabel: string;
}) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 18, left: 0, bottom: 30 }}>
          <CartesianGrid stroke="#EEF2F7" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#6B7280", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#E5E7EB" }}
            interval={0}
            angle={-15}
            textAnchor="end"
            height={70}
          />
          <YAxis
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
          <ReferenceLine
            y={averageY}
            stroke="#5F2EE5"
            strokeDasharray="6 6"
            label={{
              value: averageLabel,
              position: "insideTopRight",
              fill: "#5F2EE5",
              fontSize: 11,
              fontWeight: 700,
            }}
          />
          <Bar dataKey="value" fill="#1E2F97" radius={[12, 12, 0, 0]} barSize={38} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
