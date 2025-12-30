"use server";

import { revalidatePath } from "next/cache";
import {
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  createBlogTag,
  updateBlogTag,
  deleteBlogTag,
  hardDeleteBlogCategory,
  hardDeleteBlogTag,
  restoreBlogCategory,
  restoreBlogTag,
} from "./api";
import type { BlogCategoryUpsertDto, BlogTagUpsertDto } from "./types";

// CATEGORY
export async function upsertBlogCategoryAction(payload: BlogCategoryUpsertDto) {
  if (payload.id) {
    await updateBlogCategory(payload.id, payload);
  } else {
    await createBlogCategory(payload);
  }

  revalidatePath("/admin/blog-categories");
}

export async function deleteBlogCategoryAction(id: string) {
  await deleteBlogCategory(id);
  revalidatePath("/admin/blog-categories");
}

// TAG
export async function upsertBlogTagAction(payload: BlogTagUpsertDto) {
  if (payload.id) {
    await updateBlogTag(payload.id, payload);
  } else {
    await createBlogTag(payload);
  }

  revalidatePath("/admin/blog-tags");
}

export async function deleteBlogTagAction(id: string) {
  await deleteBlogTag(id);
  revalidatePath("/admin/blog-tags");
}

// CATEGORY - TRASH
export async function restoreBlogCategoryAction(id: string) {
  await restoreBlogCategory(id);
  revalidatePath("/admin/blog-categories");
  revalidatePath("/admin/blog-categories/trash");
}

export async function hardDeleteBlogCategoryAction(id: string) {
  await hardDeleteBlogCategory(id);
  revalidatePath("/admin/blog-categories");
  revalidatePath("/admin/blog-categories/trash");
}

// TAG - TRASH
export async function restoreBlogTagAction(id: string) {
  await restoreBlogTag(id);
  revalidatePath("/admin/blog-tags");
  revalidatePath("/admin/blog-tags/trash");
}

export async function hardDeleteBlogTagAction(id: string) {
  await hardDeleteBlogTag(id);
  revalidatePath("/admin/blog-tags");
  revalidatePath("/admin/blog-tags/trash");
}
