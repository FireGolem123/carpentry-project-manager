import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { BuildForm } from "@/components/builds/BuildForm";
import { updateBuild } from "@/lib/actions";
import { ParsedBuild } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditBuildPage({
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

  async function handleUpdate(data: ParsedBuild) {
    "use server";
    await updateBuild(id, data);
  }

  return (
    <PageLayout>
      <div className="max-w-lg mx-auto">
        <Link
          href={`/builds/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to build
        </Link>
        <h1 className="text-2xl font-bold mb-6">Edit Build</h1>
        <BuildForm
          initialData={build}
          onSubmit={handleUpdate}
          submitLabel="Save Changes"
        />
      </div>
    </PageLayout>
  );
}
