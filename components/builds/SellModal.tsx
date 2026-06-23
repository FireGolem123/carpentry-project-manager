"use client";

import { Build } from "@/lib/types";
import { markAsSold } from "@/lib/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface SellModalProps {
  build: Build;
  open: boolean;
  onClose: () => void;
}

export function SellModal({ build, open, onClose }: SellModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const [salePrice, setSalePrice] = useState(
    build.sale_price?.toString() ?? ""
  );
  const [buyerName, setBuyerName] = useState(build.buyer_name ?? "");
  const [soldVia, setSoldVia] = useState(build.sold_via ?? "");
  const [dateSold, setDateSold] = useState(today);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!salePrice) return;
    startTransition(async () => {
      try {
        await markAsSold(build.id, {
          sale_price: parseFloat(salePrice),
          buyer_name: buyerName || null,
          sold_via: soldVia || null,
          date_sold: dateSold || null,
        });
        toast.success(`${build.name} marked as sold!`);
        onClose();
      } catch {
        toast.error("Failed to update. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark as Sold</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">{build.name}</p>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="sale_price">Sale Price *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                $
              </span>
              <Input
                id="sale_price"
                type="number"
                step="0.01"
                min="0"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                required
                placeholder="0.00"
                className="pl-7"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="buyer_name">Buyer Name</Label>
            <Input
              id="buyer_name"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sold_via">Sold Via</Label>
            <Input
              id="sold_via"
              value={soldVia}
              onChange={(e) => setSoldVia(e.target.value)}
              placeholder="Facebook, Etsy, Direct…"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date_sold">Date Sold</Label>
            <Input
              id="date_sold"
              type="date"
              value={dateSold}
              onChange={(e) => setDateSold(e.target.value)}
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !salePrice}>
              {isPending ? "Saving…" : "Mark as Sold"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
