"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Build } from "@/lib/types";

export async function createBuild(data: Partial<Build>) {
  const supabase = await createClient();
  const { data: build, error } = await supabase
    .from("builds")
    .insert(data)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/");
  redirect(`/builds/${build.id}`);
}

export async function updateBuild(id: string, data: Partial<Build>) {
  const supabase = await createClient();
  const { error } = await supabase.from("builds").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath(`/builds/${id}`);
  redirect(`/builds/${id}`);
}

export async function deleteBuild(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("builds").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  redirect("/");
}

export async function markAsSold(
  id: string,
  data: {
    sale_price: number;
    buyer_name?: string | null;
    sold_via?: string | null;
    date_sold?: string | null;
  }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("builds")
    .update({ ...data, status: "sold" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath(`/builds/${id}`);
}

export async function markAsCompleted(id: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const { error } = await supabase
    .from("builds")
    .update({ status: "completed", date_completed: today })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath(`/builds/${id}`);
}

export async function uploadPhoto(buildId: string, formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${buildId}/${Date.now()}.${ext}`;

  const { error: storageError } = await supabase.storage
    .from("build-photos")
    .upload(path, file, { upsert: false });
  if (storageError) throw new Error(storageError.message);

  const { error: dbError } = await supabase
    .from("build_photos")
    .insert({ build_id: buildId, storage_url: path });
  if (dbError) throw new Error(dbError.message);

  revalidatePath(`/builds/${buildId}`);
}

export async function deletePhoto(
  photoId: string,
  storagePath: string,
  buildId: string
) {
  const supabase = await createClient();

  const { error: storageError } = await supabase.storage
    .from("build-photos")
    .remove([storagePath]);
  if (storageError) throw new Error(storageError.message);

  const { error: dbError } = await supabase
    .from("build_photos")
    .delete()
    .eq("id", photoId);
  if (dbError) throw new Error(dbError.message);

  revalidatePath(`/builds/${buildId}`);
}
