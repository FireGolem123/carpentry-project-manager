"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Props {
  data: { platform: string; revenue: number; count: number }[];
}

const COLORS = ["#412402", "#BA7517", "#D4881F", "#EF9F27", "#7A4A1E"];

export function PlatformChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        No platform data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
        barSize={36}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#BA751730" vertical={false} />
        <XAxis
          dataKey="platform"
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
          formatter={(value, _name, props) => {
            const n = Number(value ?? 0);
            const count = (props?.payload as { count?: number })?.count ?? 0;
            return [`$${n.toFixed(0)} (${count} piece${count !== 1 ? "s" : ""})`, "Revenue"];
          }}
        />
        <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
          {data.map((_entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
