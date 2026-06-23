import { createClient } from "@/lib/supabase/server";
import { Build, BuildStatus } from "@/lib/types";
import { PageLayout } from "@/components/layout/PageLayout";
import { BuildCard } from "@/components/builds/BuildCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

const STATUS_FILTERS: { value: BuildStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "sold", label: "Sold" },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const activeFilter = (params.status as BuildStatus | "all") ?? "all";

  const supabase = await createClient();

  let query = supabase
    .from("builds")
    .select("*")
    .order("created_at", { ascending: false });

  if (activeFilter !== "all") {
    query = query.eq("status", activeFilter);
  }

  const { data: builds } = await query;

  // Fetch one photo per build for thumbnails
  const buildIds = (builds ?? []).map((b: Build) => b.id);
  const { data: photos } = buildIds.length
    ? await supabase
        .from("build_photos")
        .select("build_id, storage_url")
        .in("build_id", buildIds)
    : { data: [] };

  const thumbnailMap: Record<string, string> = {};
  for (const photo of photos ?? []) {
    if (!thumbnailMap[photo.build_id]) {
      const { data } = supabase.storage
        .from("build-photos")
        .getPublicUrl(photo.storage_url);
      thumbnailMap[photo.build_id] = data.publicUrl;
    }
  }

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Builds</h1>
        <Button render={<Link href="/builds/new" />} nativeButton={false}>
          <Plus className="w-4 h-4" />
          New Build
        </Button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_FILTERS.map(({ value, label }) => (
          <Link
            key={value}
            href={value === "all" ? "/" : `/?status=${value}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              activeFilter === value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:bg-muted"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {!builds || builds.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">
            {activeFilter === "all"
              ? "No builds yet — log your first one!"
              : `No ${activeFilter.replace("_", " ")} builds.`}
          </p>
          {activeFilter === "all" && (
            <Button render={<Link href="/builds/new" />} nativeButton={false}>
              <Plus className="w-4 h-4" />
              Log a Build
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {(builds as Build[]).map((build) => (
            <BuildCard
              key={build.id}
              build={build}
              thumbnailUrl={thumbnailMap[build.id]}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
