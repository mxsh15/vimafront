"use server";

import { apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function upsertCategoryFormAction(formData: FormData) {
  const id = (formData.get("id") as string | null) || "";
  const title = (formData.get("title") as string | null) ?? "";
  const slug = (formData.get("slug") as string | null) ?? "";
  const sortOrderStr = (formData.get("sortOrder") as string | null) ?? "0";
  const isActiveStr = (formData.get("isActive") as string | null) ?? "true";
  const parentId = (formData.get("parentId") as string | null) || null;

  const payload = {
    title,
    slug,
    contentHtml: (formData.get("contentHtml") as string | null) ?? null,
    iconUrl: (formData.get("iconUrl") as string | null) ?? null,
    parentId,
    sortOrder: Number(sortOrderStr) || 0,
    isActive: isActiveStr === "true",
    seoTitle: (formData.get("seoTitle") as string | null) ?? null,
    seoDescription: (formData.get("seoDescription") as string | null) ?? null,
    seoKeywords: (formData.get("seoKeywords") as string | null) ?? null,
  };

  if (id) {
    await serverFetch<void>(`productCategories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  } else {
    await serverFetch<void>("productCategories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  revalidatePath("/admin/categories");
}

export async function deleteCategoryAction(id: string) {
  await serverFetch<void>(`productCategories/${id}`, { method: "DELETE" });
  revalidatePath("/admin/categories");
}


export async function restoreCategory(id: string) {
  return serverFetch<void>(`productCategories/${id}/restore`, {
    method: "POST",
  });
}

export async function hardDeleteCategory(id: string) {
  return serverFetch<void>(`productCategories/${id}/hard`, {
    method: "DELETE",
  });
}