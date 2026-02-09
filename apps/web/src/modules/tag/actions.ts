"use server";

import { revalidatePath } from "next/cache";
import { tagSchema } from "./schemas";
import { upsertTag, deleteTag, restoreTag, hardDeleteTag } from "./api";

export async function upsertTagFormAction(formData: FormData) {
  const raw = {
    id: formData.get("id")?.toString() || undefined,
    name: (formData.get("name") ?? "").toString(),
    slug: (formData.get("slug") ?? "").toString(),
    rowVersion: formData.get("rowVersion")?.toString() || null,
  };

  const parsed = tagSchema.safeParse(raw);
  if (!parsed.success) {
    console.error(parsed.error.format());
    throw new Error(parsed.error.errors[0]?.message ?? "داده نامعتبر است");
  }

  await upsertTag(parsed.data);
  revalidatePath("/admin/tags");
}

export async function deleteTagAction(id: string) {
  await deleteTag(id);
  revalidatePath("/admin/tags");
}

export async function restoreTagAction(id: string) {
  await restoreTag(id);
  revalidatePath("/admin/tags");
  revalidatePath("/admin/tags/trash");
}

export async function hardDeleteTagAction(id: string) {
  await hardDeleteTag(id);
  revalidatePath("/admin/tags/trash");
}
