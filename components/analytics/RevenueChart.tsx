"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: { month: string; revenue: number; profit: number }[];
}

export function RevenueChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        No sales data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#BA751730" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "#7A4A1E" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#7A4A1E" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v}`}
          width={50}
        />
        <Tooltip
          contentStyle={{
            background: "#FAEEDA",
            border: "1px solid #BA7517",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value) => [`$${Number(value ?? 0).toFixed(0)}`, undefined]}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#7A4A1E" }} />
        <Line
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="#BA7517"
          strokeWidth={2.5}
          dot={{ fill: "#BA7517", r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="profit"
          name="Profit"
          stroke="#412402"
          strokeWidth={2.5}
          dot={{ fill: "#412402", r: 4 }}
          activeDot={{ r: 6 }}
          strokeDasharray="5 3"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
