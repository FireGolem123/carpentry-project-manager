"use client";

import { Build } from "@/lib/types";
import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { SellModal } from "./SellModal";
import { markAsCompleted } from "@/lib/actions";
import Link from "next/link";
import Image from "next/image";
import { Clock, DollarSign, Layers } from "lucide-react";
import { toast } from "sonner";

interface BuildCardProps {
  build: Build;
  thumbnailUrl?: string;
}

export function BuildCard({ build, thumbnailUrl }: BuildCardProps) {
  const [showSellModal, setShowSellModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleMarkCompleted() {
    startTransition(async () => {
      try {
        await markAsCompleted(build.id);
        toast.success(`${build.name} marked as completed`);
      } catch {
        toast.error("Failed to update. Please try again.");
      }
    });
  }

  const profit =
    build.sale_price != null && build.material_cost != null
      ? build.sale_price - build.material_cost
      : null;

  return (
    <>
      <Card className="overflow-hidden flex flex-col group">
        <Link href={`/builds/${build.id}`} className="block">
          <div className="aspect-square bg-muted relative overflow-hidden">
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={build.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-border">
                <Layers className="w-12 h-12 opacity-40" />
              </div>
            )}
          </div>
        </Link>

        <CardContent className="p-4 flex flex-col gap-2 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/builds/${build.id}`}
              className="font-semibold leading-tight hover:underline underline-offset-2 line-clamp-2"
            >
              {build.name}
            </Link>
            <StatusBadge status={build.status} />
          </div>

          {(build.wood_type || build.primary_material) && (
            <p className="text-sm text-muted-foreground">
              {build.wood_type ?? build.primary_material}
              {build.finish_type && ` · ${build.finish_type}`}
            </p>
          )}

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-auto pt-2 border-t border-border/40">
            {build.hours_spent != null && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {build.hours_spent}h
              </span>
            )}
            {build.material_cost != null && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                {build.material_cost.toFixed(0)} cost
              </span>
            )}
            {build.sale_price != null && (
              <span className="flex items-center gap-1 font-medium text-foreground">
                <DollarSign className="w-3.5 h-3.5" />
                {build.sale_price.toFixed(0)}
                {profit != null && (
                  <span className="text-xs text-muted-foreground font-normal">
                    ({profit >= 0 ? "+" : ""}${profit.toFixed(0)})
                  </span>
                )}
              </span>
            )}
          </div>

          {build.status !== "sold" && (
            <div className="flex gap-1.5 mt-1">
              {build.status === "in_progress" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={handleMarkCompleted}
                  disabled={isPending}
                >
                  Completed
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => setShowSellModal(true)}
                disabled={isPending}
              >
                Mark as Sold
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showSellModal && (
        <SellModal
          build={build}
          open={showSellModal}
          onClose={() => setShowSellModal(false)}
        />
      )}
    </>
  );
}
