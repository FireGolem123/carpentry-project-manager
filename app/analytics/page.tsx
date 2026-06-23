import { createClient } from "@/lib/supabase/server";
import { PageLayout } from "@/components/layout/PageLayout";
import { StatsCards } from "@/components/analytics/StatsCards";
import { RevenueChart } from "@/components/analytics/RevenueChart";
import { PlatformChart } from "@/components/analytics/PlatformChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Build, AnalyticsData, BuildStatus } from "@/lib/types";
import { Download } from "lucide-react";
import { CsvExportButton } from "@/components/analytics/CsvExportButton";

function computeAnalytics(builds: Build[]): AnalyticsData {
  const sold = builds.filter((b) => b.status === "sold");

  const totalRevenue = sold.reduce((s, b) => s + (b.sale_price ?? 0), 0);
  const totalCost = sold.reduce((s, b) => s + (b.material_cost ?? 0), 0);
  const totalProfit = totalRevenue - totalCost;
  const avgProfit = sold.length > 0 ? totalProfit / sold.length : 0;

  const bestPiece = sold.reduce<Build | null>((best, b) => {
    const profit = (b.sale_price ?? 0) - (b.material_cost ?? 0);
    const bestProfit = best ? (best.sale_price ?? 0) - (best.material_cost ?? 0) : -Infinity;
    return profit > bestProfit ? b : best;
  }, null);

  // Revenue by month
  const monthMap = new Map<string, { revenue: number; cost: number }>();
  for (const b of sold) {
    const d = b.date_sold ?? b.created_at;
    const month = d.slice(0, 7); // YYYY-MM
    const cur = monthMap.get(month) ?? { revenue: 0, cost: 0 };
    monthMap.set(month, {
      revenue: cur.revenue + (b.sale_price ?? 0),
      cost: cur.cost + (b.material_cost ?? 0),
    });
  }
  const revenueByMonth = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { revenue, cost }]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-CA", {
        month: "short",
        year: "2-digit",
      }),
      revenue,
      profit: revenue - cost,
    }));

  // Revenue by platform
  const platformMap = new Map<string, { revenue: number; count: number }>();
  for (const b of sold) {
    const platform = b.sold_via ?? "Direct";
    const cur = platformMap.get(platform) ?? { revenue: 0, count: 0 };
    platformMap.set(platform, {
      revenue: cur.revenue + (b.sale_price ?? 0),
      count: cur.count + 1,
    });
  }
  const revenueByPlatform = Array.from(platformMap.entries())
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .map(([platform, { revenue, count }]) => ({ platform, revenue, count }));

  // Status counts
  const statusMap = new Map<BuildStatus, number>();
  for (const b of builds) {
    statusMap.set(b.status, (statusMap.get(b.status) ?? 0) + 1);
  }
  const statusCounts = (["in_progress", "completed", "sold"] as BuildStatus[]).map(
    (status) => ({ status, count: statusMap.get(status) ?? 0 })
  );

  return {
    totalRevenue,
    totalProfit,
    avgProfit,
    pieceCount: sold.length,
    bestPiece,
    revenueByMonth,
    revenueByPlatform,
    statusCounts,
  };
}

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: builds } = await supabase
    .from("builds")
    .select("*")
    .order("created_at", { ascending: true });

  const allBuilds = (builds ?? []) as Build[];
  const analytics = computeAnalytics(allBuilds);
  const soldBuilds = allBuilds.filter((b) => b.status === "sold");

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <CsvExportButton builds={soldBuilds} />
        </div>

        <StatsCards data={analytics} />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart data={analytics.revenueByMonth} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Revenue by Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <PlatformChart data={analytics.revenueByPlatform} />
            </CardContent>
          </Card>
        </div>

        {/* Sales table */}
        {soldBuilds.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Sold Pieces</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Piece</th>
                    <th className="pb-2 pr-4 font-medium">Material</th>
                    <th className="pb-2 pr-4 font-medium text-right">Cost</th>
                    <th className="pb-2 pr-4 font-medium text-right">Sale</th>
                    <th className="pb-2 pr-4 font-medium text-right">Profit</th>
                    <th className="pb-2 font-medium">Platform</th>
                  </tr>
                </thead>
                <tbody>
                  {soldBuilds.map((b) => {
                    const profit = (b.sale_price ?? 0) - (b.material_cost ?? 0);
                    return (
                      <tr key={b.id} className="border-b border-border/50 last:border-0">
                        <td className="py-2 pr-4">{b.name}</td>
                        <td className="py-2 pr-4 text-muted-foreground">
                          {b.wood_type ?? b.primary_material ?? "—"}
                        </td>
                        <td className="py-2 pr-4 text-right">
                          {b.material_cost != null ? `$${b.material_cost.toFixed(0)}` : "—"}
                        </td>
                        <td className="py-2 pr-4 text-right font-medium">
                          {b.sale_price != null ? `$${b.sale_price.toFixed(0)}` : "—"}
                        </td>
                        <td className="py-2 pr-4 text-right">
                          {b.sale_price != null ? `$${profit.toFixed(0)}` : "—"}
                        </td>
                        <td className="py-2 text-muted-foreground">
                          {b.sold_via ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
