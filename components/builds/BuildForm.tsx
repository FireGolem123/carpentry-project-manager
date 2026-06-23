"use client";

import { Build, BuildStatus, ParsedBuild } from "@/lib/types";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface BuildFormProps {
  initialData?: ParsedBuild;
  onSubmit: (data: ParsedBuild) => Promise<unknown>;
  submitLabel?: string;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function MoneyInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
        $
      </span>
      <Input
        type="number"
        step="0.01"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "0.00"}
        className="pl-7"
      />
    </div>
  );
}

export function BuildForm({
  initialData,
  onSubmit,
  submitLabel = "Save Build",
}: BuildFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [status, setStatus] = useState<BuildStatus>(
    initialData?.status ?? "in_progress"
  );
  const [primaryMaterial, setPrimaryMaterial] = useState(
    initialData?.primary_material ?? ""
  );
  const [woodType, setWoodType] = useState(initialData?.wood_type ?? "");
  const [finishType, setFinishType] = useState(initialData?.finish_type ?? "");
  const [otherMaterials, setOtherMaterials] = useState(
    initialData?.other_materials ?? ""
  );
  const [hoursSpent, setHoursSpent] = useState(
    initialData?.hours_spent?.toString() ?? ""
  );
  const [materialCost, setMaterialCost] = useState(
    initialData?.material_cost?.toString() ?? ""
  );
  const [salePrice, setSalePrice] = useState(
    initialData?.sale_price?.toString() ?? ""
  );
  const [buyerName, setBuyerName] = useState(initialData?.buyer_name ?? "");
  const [soldVia, setSoldVia] = useState(initialData?.sold_via ?? "");
  const [dateStarted, setDateStarted] = useState(
    initialData?.date_started ?? ""
  );
  const [dateCompleted, setDateCompleted] = useState(
    initialData?.date_completed ?? ""
  );
  const [dateSold, setDateSold] = useState(initialData?.date_sold ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Build name is required");
      return;
    }
    startTransition(async () => {
      try {
        await onSubmit({
          name: name.trim(),
          status,
          primary_material: primaryMaterial || null,
          wood_type: woodType || null,
          finish_type: finishType || null,
          other_materials: otherMaterials || null,
          hours_spent: hoursSpent ? parseFloat(hoursSpent) : null,
          material_cost: materialCost ? parseFloat(materialCost) : null,
          sale_price: salePrice ? parseFloat(salePrice) : null,
          buyer_name: buyerName || null,
          sold_via: soldVia || null,
          date_started: dateStarted || null,
          date_completed: dateCompleted || null,
          date_sold: dateSold || null,
          notes: notes || null,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Something went wrong";
        if (!msg.includes("NEXT_REDIRECT")) {
          toast.error(msg);
        }
      }
    });
  }

  const showSaleFields = status === "sold" || status === "completed";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Build Info */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Build Info
        </h2>
        <Field label="Name *">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Walnut Coffee Table"
            required
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Status">
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as BuildStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Date Started">
            <Input
              type="date"
              value={dateStarted}
              onChange={(e) => setDateStarted(e.target.value)}
            />
          </Field>
        </div>
        {status !== "in_progress" && (
          <Field label="Date Completed">
            <Input
              type="date"
              value={dateCompleted}
              onChange={(e) => setDateCompleted(e.target.value)}
            />
          </Field>
        )}
      </section>

      <Separator />

      {/* Materials */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Materials
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Primary Material">
            <Input
              value={primaryMaterial}
              onChange={(e) => setPrimaryMaterial(e.target.value)}
              placeholder="Walnut"
            />
          </Field>
          <Field label="Wood Type">
            <Input
              value={woodType}
              onChange={(e) => setWoodType(e.target.value)}
              placeholder="Black Walnut"
            />
          </Field>
        </div>
        <Field label="Finish">
          <Input
            value={finishType}
            onChange={(e) => setFinishType(e.target.value)}
            placeholder="Danish Oil, Lacquer, Wax…"
          />
        </Field>
        <Field label="Extra Materials">
          <Textarea
            value={otherMaterials}
            onChange={(e) => setOtherMaterials(e.target.value)}
            placeholder="Brass hardware, dowels, glue…"
            rows={2}
          />
        </Field>
      </section>

      <Separator />

      {/* Economics */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Time & Cost
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Hours Spent">
            <Input
              type="number"
              step="0.5"
              min="0"
              value={hoursSpent}
              onChange={(e) => setHoursSpent(e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field label="Material Cost">
            <MoneyInput
              value={materialCost}
              onChange={setMaterialCost}
              placeholder="0.00"
            />
          </Field>
        </div>
      </section>

      {showSaleFields && (
        <>
          <Separator />
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Sale Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Sale Price">
                <MoneyInput value={salePrice} onChange={setSalePrice} />
              </Field>
              <Field label="Date Sold">
                <Input
                  type="date"
                  value={dateSold}
                  onChange={(e) => setDateSold(e.target.value)}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Buyer Name">
                <Input
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Optional"
                />
              </Field>
              <Field label="Sold Via">
                <Input
                  value={soldVia}
                  onChange={(e) => setSoldVia(e.target.value)}
                  placeholder="Facebook, Etsy, Direct…"
                />
              </Field>
            </div>
          </section>
        </>
      )}

      <Separator />

      {/* Notes */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Notes
        </h2>
        <Field label="Details & Notes">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything else worth remembering about this build…"
            rows={4}
          />
        </Field>
      </section>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
