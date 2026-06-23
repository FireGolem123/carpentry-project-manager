"use client";

import { uploadPhoto, deletePhoto } from "@/lib/actions";
import { BuildPhoto } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { ImagePlus, Trash2, Loader2 } from "lucide-react";

interface PhotoUploadProps {
  buildId: string;
  photos: (BuildPhoto & { publicUrl: string })[];
}

export function PhotoUpload({ buildId, photos }: PhotoUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        await uploadPhoto(buildId, formData);
      }
      toast.success(files.length === 1 ? "Photo added" : `${files.length} photos added`);
    } catch {
      toast.error("Upload failed. Check file type and try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleDelete(photo: BuildPhoto & { publicUrl: string }) {
    setDeletingId(photo.id);
    startTransition(async () => {
      try {
        await deletePhoto(photo.id, photo.storage_url, buildId);
        toast.success("Photo deleted");
      } catch {
        toast.error("Delete failed. Please try again.");
      } finally {
        setDeletingId(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
              <Image
                src={photo.publicUrl}
                alt="Build photo"
                fill
                className="object-cover"
              />
              <button
                onClick={() => handleDelete(photo)}
                disabled={deletingId === photo.id || isPending}
                className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center"
              >
                {deletingId === photo.id ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Trash2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
      >
        {uploading ? (
          <>
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            <p className="text-sm text-muted-foreground">Uploading…</p>
          </>
        ) : (
          <>
            <ImagePlus className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              Tap to add photos
            </p>
          </>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
    </div>
  );
}
