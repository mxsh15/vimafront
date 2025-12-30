"use server";

import { revalidatePath } from "next/cache";
import { blogPostUpsertSchema } from "./schemas";
import {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  restoreBlogPost,
  hardDeleteBlogPost,
} from "./api";

export async function upsertBlogPostFormAction(formData: FormData) {
  const categoryIdsRaw = formData.getAll("categoryIds") as string[];
  const categoryIds = categoryIdsRaw
    .map((x) => String(x).trim())
    .filter(Boolean);

  const tagIdsRaw = formData.getAll("tagIds") as string[];
  const tagIds = tagIdsRaw.map((x) => String(x).trim()).filter(Boolean);

  const seoSchemaJson = String(formData.get("seoSchemaJson") ?? "").trim();
  const authorIdRaw = String(formData.get("authorId") ?? "").trim();

  const raw = {
    id: formData.get("id")?.toString() || undefined,
    title: formData.get("title")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
    contentHtml: formData.get("contentHtml")?.toString() || null,

    thumbnailMediaId: formData.get("thumbnailMediaId")?.toString() || null,

    status: formData.get("status")?.toString() ?? "1",
    visibility: formData.get("visibility")?.toString() ?? "0",

    categoryIds,
    tagIds,

    metaTitle: formData.get("metaTitle")?.toString() || null,
    metaDescription: formData.get("metaDescription")?.toString() || null,
    metaKeywords: formData.get("metaKeywords")?.toString() || null,
    canonicalUrl: formData.get("canonicalUrl")?.toString() || null,
    openGraphTitle: formData.get("openGraphTitle")?.toString() || null,
    openGraphDescription:
      formData.get("openGraphDescription")?.toString() || null,
    openGraphImageUrl: formData.get("openGraphImageUrl")?.toString() || null,
    seoSchemaJson: seoSchemaJson.length ? seoSchemaJson : null,
    autoGenerateHeadTags:
      formData.get("autoGenerateHeadTags")?.toString() === "on",
    includeInSitemap: formData.get("includeInSitemap")?.toString() === "on",
    authorId: authorIdRaw.length ? authorIdRaw : null,
  };

  const payload = blogPostUpsertSchema.parse(raw);

  if (payload.id) {
    await updateBlogPost(payload.id, payload);
  } else {
    await createBlogPost(payload);
  }

  revalidatePath("/admin/blog-posts");
}

export async function deleteBlogPostAction(id: string) {
  await deleteBlogPost(id);
  revalidatePath("/admin/blog-posts");
}

export async function restoreBlogPostAction(id: string) {
  await restoreBlogPost(id);
  revalidatePath("/admin/blog-posts");
  revalidatePath("/admin/blog-posts/trash");
}

export async function hardDeleteBlogPostAction(id: string) {
  await hardDeleteBlogPost(id);
  revalidatePath("/admin/blog-posts/trash");
}
