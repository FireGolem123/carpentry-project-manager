import { AnalyticsData } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign, Package, Award } from "lucide-react";

function fmt(n: number) {
  return n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
}

export function StatsCards({ data }: { data: AnalyticsData }) {
  const cards = [
    {
      label: "Total Revenue",
      value: fmt(data.totalRevenue),
      sub: `${data.pieceCount} piece${data.pieceCount !== 1 ? "s" : ""} sold`,
      icon: DollarSign,
    },
    {
      label: "Total Profit",
      value: fmt(data.totalProfit),
      sub: data.pieceCount > 0 ? `${fmt(data.avgProfit)} avg / piece` : "No sales yet",
      icon: TrendingUp,
    },
    {
      label: "Builds",
      value: String(data.statusCounts.reduce((s, c) => s + c.count, 0)),
      sub: `${data.statusCounts.find((s) => s.status === "in_progress")?.count ?? 0} in progress · ${data.statusCounts.find((s) => s.status === "completed")?.count ?? 0} done`,
      icon: Package,
    },
    {
      label: "Best Piece",
      value: data.bestPiece ? fmt((data.bestPiece.sale_price ?? 0) - (data.bestPiece.material_cost ?? 0)) : "—",
      sub: data.bestPiece?.name ?? "No sales yet",
      icon: Award,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map(({ label, value, sub, icon: Icon }) => (
        <Card key={label}>
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {label}
              </span>
              <Icon className="w-4 h-4 text-accent" />
            </div>
            <p className="text-xl font-bold leading-none">{value}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
