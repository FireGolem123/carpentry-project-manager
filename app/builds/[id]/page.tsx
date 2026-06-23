import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { PhotoUpload } from "@/components/builds/PhotoUpload";
import { StatusBadge } from "@/components/builds/StatusBadge";
import { DeleteBuildButton } from "@/components/builds/DeleteBuildButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { BuildPhoto } from "@/lib/types";
import {
  Clock,
  DollarSign,
  User,
  ShoppingBag,
  Calendar,
  Pencil,
  ArrowLeft,
} from "lucide-react";

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | null | undefined;
}) {
  if (value == null || value === "") return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-accent mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export default async function BuildDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: build } = await supabase
    .from("builds")
    .select("*")
    .eq("id", id)
    .single();

  if (!build) notFound();

  const { data: photoRows } = await supabase
    .from("build_photos")
    .select("*")
    .eq("build_id", id)
    .order("created_at", { ascending: true });

  const photos = (photoRows ?? []).map((p: BuildPhoto) => ({
    ...p,
    publicUrl: supabase.storage
      .from("build-photos")
      .getPublicUrl(p.storage_url).data.publicUrl,
  }));

  const profit =
    build.sale_price != null && build.material_cost != null
      ? build.sale_price - build.material_cost
      : null;

  const fmt = (n: number) =>
    n.toLocaleString("en-CA", { style: "currency", currency: "CAD" });

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All Builds
            </Link>
            <h1 className="text-2xl font-bold leading-tight">{build.name}</h1>
            <div className="mt-2">
              <StatusBadge status={build.status} />
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              render={<Link href={`/builds/${id}/edit`} />}
              nativeButton={false}
              variant="outline"
              size="sm"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
            <DeleteBuildButton buildId={id} />
          </div>
        </div>

        {/* Photos */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3">Photos</h2>
            <PhotoUpload buildId={id} photos={photos} />
          </CardContent>
        </Card>

        {/* Build info */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="font-semibold">Build Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow
                icon={ShoppingBag}
                label="Material"
                value={
                  [build.wood_type, build.primary_material]
                    .filter(Boolean)
                    .join(" — ") || null
                }
              />
              <InfoRow icon={ShoppingBag} label="Finish" value={build.finish_type} />
              <InfoRow icon={Clock} label="Hours" value={build.hours_spent != null ? `${build.hours_spent}h` : null} />
              <InfoRow
                icon={Calendar}
                label="Started"
                value={build.date_started ? new Date(build.date_started).toLocaleDateString("en-CA") : null}
              />
              <InfoRow
                icon={Calendar}
                label="Completed"
                value={build.date_completed ? new Date(build.date_completed).toLocaleDateString("en-CA") : null}
              />
              <InfoRow
                icon={DollarSign}
                label="Material Cost"
                value={build.material_cost != null ? fmt(build.material_cost) : null}
              />
            </div>
            {build.other_materials && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Extra Materials</p>
                <p className="text-sm">{build.other_materials}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sale info */}
        {build.status === "sold" && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <h2 className="font-semibold">Sale</h2>
              <div className="grid grid-cols-2 gap-4">
                <InfoRow
                  icon={DollarSign}
                  label="Sale Price"
                  value={build.sale_price != null ? fmt(build.sale_price) : null}
                />
                <InfoRow
                  icon={DollarSign}
                  label="Profit"
                  value={profit != null ? `${fmt(profit)} ${profit >= 0 ? "✓" : "↓"}` : null}
                />
                <InfoRow icon={User} label="Buyer" value={build.buyer_name} />
                <InfoRow icon={ShoppingBag} label="Platform" value={build.sold_via} />
                <InfoRow
                  icon={Calendar}
                  label="Date Sold"
                  value={build.date_sold ? new Date(build.date_sold).toLocaleDateString("en-CA") : null}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {build.notes && (
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-2">Notes</h2>
              <p className="text-sm whitespace-pre-wrap">{build.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
