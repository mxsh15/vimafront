"use server";

import { revalidatePath } from "next/cache";
import { createBrand, updateBrand, deleteBrand } from "@/modules/brand/api";
import type { BrandUpsertInput } from "@/modules/brand/schemas";
import { apiFetch } from "@/lib/api";

export async function upsertBrandFormAction(formData: FormData) {
  const id = (formData.get("id") as string) || undefined;

  const payload: BrandUpsertInput = {
    title: String(formData.get("title") || "").trim(),
    englishTitle: (formData.get("englishTitle") as string) || null,
    slug: String(formData.get("slug") || "").trim(),
    websiteUrl: (formData.get("websiteUrl") as string) || null,
    contentHtml: (formData.get("contentHtml") as string) || null,
    logoUrl: (formData.get("logoUrl") as string) || null,
    seo: null,
    rowVersion: (formData.get("rowVersion") as string) || null,
  };

  if (!payload.title || !payload.slug) {
    throw new Error("عنوان و نامک (slug) الزامی هستند.");
  }

  if (id) {
    await updateBrand(id, payload);
  } else {
    await createBrand(payload);
  }

  revalidatePath("/shop/brands");
}

export async function upsertBrandAction(
  id: string | undefined,
  payload: BrandUpsertInput
) {
  if (id) await updateBrand(id, payload);
  else await createBrand(payload);
  revalidatePath("/shop/brands");
}

export async function deleteBrandAction(id: string) {
  await deleteBrand(id);
  revalidatePath("/shop/brands");
}

export async function restoreBrandAction(id: string) {
  await serverFetch<void>(`brands/${id}/restore`, { method: "POST" });
  revalidatePath("/admin/brands");
  revalidatePath("/admin/brands/trash");
}

export async function hardDeleteBrandAction(id: string) {
  await serverFetch<void>(`brands/${id}/hard`, { method: "DELETE" });
  revalidatePath("/admin/brands/trash");
}
