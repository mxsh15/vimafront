"use server";

import { revalidateTag } from "next/cache";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory,
  hardDeleteCategory,
} from "./api";

const TAGS = {
  list: "categories",
  trash: "categories:trash",
  detail: (id: string) => `category:${id}`,
};

export async function upsertCategoryFormAction(formData: FormData) {
  const id = (formData.get("id") as string | null) || "";
  const title = (formData.get("title") as string | null) ?? "";
  const slug = (formData.get("slug") as string | null) ?? "";
  const sortOrderStr = (formData.get("sortOrder") as string | null) ?? "0";
  const isActiveStr = (formData.get("isActive") as string | null) ?? "true";
  const parentIdRaw = String(formData.get("parentId") ?? "").trim();
  const parentId = parentIdRaw.length ? parentIdRaw : null;

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
    await updateCategory(id, payload);
    revalidateTag(TAGS.detail(id), "max");
  } else {
    await createCategory(payload);
  }

  revalidateTag(TAGS.list, "max");
  revalidateTag(TAGS.trash, "max");
}

export async function deleteCategoryAction(id: string) {
  await deleteCategory(id);
  revalidateTag(TAGS.list, "max");
  revalidateTag(TAGS.trash, "max");
  revalidateTag(TAGS.detail(id), "max");
}

export async function restoreCategoryAction(id: string) {
  await restoreCategory(id);
  revalidateTag(TAGS.list, "max");
  revalidateTag(TAGS.trash, "max");
  revalidateTag(TAGS.detail(id), "max");
}

export async function hardDeleteCategoryAction(id: string) {
  await hardDeleteCategory(id);
  revalidateTag(TAGS.trash, "max");
  revalidateTag(TAGS.detail(id), "max");
}
