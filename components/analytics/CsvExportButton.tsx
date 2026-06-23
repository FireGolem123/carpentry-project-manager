"use client";

import { Build } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface Props {
  builds: Build[];
}

function escapeCell(value: string | number | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function CsvExportButton({ builds }: Props) {
  function handleExport() {
    const headers = [
      "Name",
      "Material",
      "Wood Type",
      "Finish",
      "Material Cost",
      "Sale Price",
      "Profit",
      "Buyer",
      "Platform",
      "Date Sold",
      "Hours Spent",
    ];

    const rows = builds.map((b) => {
      const profit =
        b.sale_price != null && b.material_cost != null
          ? b.sale_price - b.material_cost
          : null;
      return [
        escapeCell(b.name),
        escapeCell(b.primary_material),
        escapeCell(b.wood_type),
        escapeCell(b.finish_type),
        escapeCell(b.material_cost),
        escapeCell(b.sale_price),
        escapeCell(profit),
        escapeCell(b.buyer_name),
        escapeCell(b.sold_via),
        escapeCell(b.date_sold),
        escapeCell(b.hours_spent),
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `build-log-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
      <Download className="w-3.5 h-3.5" />
      Export CSV
    </Button>
  );
}
