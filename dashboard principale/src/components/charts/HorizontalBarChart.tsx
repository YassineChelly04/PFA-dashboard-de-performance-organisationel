"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function HorizontalBarChart({
  data,
  barColor = "#1E2F97",
}: {
  data: { label: string; value: number }[];
  barColor?: string;
}) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 18, left: 8, bottom: 10 }}
        >
          <CartesianGrid stroke="#EEF2F7" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            width={170}
            tick={{ fill: "#374151", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#E5E7EB" }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              border: "1px solid #E5E7EB",
            }}
          />
          <Bar dataKey="value" fill={barColor} radius={[0, 12, 12, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
