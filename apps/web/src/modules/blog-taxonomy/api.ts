// src/modules/blog-taxonomy/api.ts
import { apiFetch } from "@/lib/api";
import type { PagedResult } from "@/shared/types/adminlistpageTypes";
import type {
  BlogCategoryListDto,
  BlogCategoryUpsertDto,
  BlogCategoryOptionDto,
  BlogTagListDto,
  BlogTagUpsertDto,
  BlogTagOptionDto,
} from "./types";

// فقط برای سرور: page.tsx و server actions

export async function listBlogCategoriesPaged(params: {
  page?: number;
  pageSize?: number;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("page", String(params.page ?? 1));
  search.set("pageSize", String(params.pageSize ?? 50));
  if (params.q && params.q.trim()) search.set("q", params.q.trim());
  return serverFetch<PagedResult<BlogCategoryListDto>>(
    `blog-categories?${search.toString()}`
  );
}

export async function listBlogCategoriesOptions() {
  return serverFetch<BlogCategoryOptionDto[]>(`blog-categories/options`);
}

export async function createBlogCategory(payload: BlogCategoryUpsertDto) {
  return serverFetch<BlogCategoryUpsertDto>("blog-categories", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
}

export async function updateBlogCategory(
  id: string,
  payload: BlogCategoryUpsertDto
) {
  return serverFetch<void>(`blog-categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
}

export async function deleteBlogCategory(id: string) {
  return serverFetch<void>(`blog-categories/${id}`, {
    method: "DELETE",
  });
}

export async function listDeletedBlogCategories({
  page = 1,
  pageSize = 20,
  q,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (q && q.trim()) params.set("q", q.trim());

  return serverFetch<PagedResult<BlogCategoryOptionDto>>(
    `blog-categories/trash?${params.toString()}`
  );
}

export async function restoreBlogCategory(id: string) {
  return serverFetch<void>(`blog-categories/${id}/restore`, { method: "POST" });
}

export async function hardDeleteBlogCategory(id: string) {
  return serverFetch<void>(`blog-categories/${id}/hard`, { method: "DELETE" });
}

// TAGS
export async function listBlogTagsPaged(params: {
  page?: number;
  pageSize?: number;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("page", String(params.page ?? 1));
  search.set("pageSize", String(params.pageSize ?? 50));
  if (params.q && params.q.trim()) search.set("q", params.q.trim());
  return serverFetch<PagedResult<BlogTagListDto>>(
    `blog-tags?${search.toString()}`
  );
}

export async function listBlogTagsOptions() {
  return serverFetch<BlogTagOptionDto[]>(`blog-tags/options`);
}

export async function getBlogTag(id: string) {
  return serverFetch<BlogTagUpsertDto>(`blog-tags/${id}`);
}

export async function createBlogTag(payload: BlogTagUpsertDto) {
  return serverFetch<BlogTagUpsertDto>("blog-tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateBlogTag(id: string, payload: BlogTagUpsertDto) {
  return serverFetch<void>(`blog-tags/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteBlogTag(id: string) {
  return serverFetch<void>(`blog-tags/${id}`, { method: "DELETE" });
}

export async function listDeletedBlogTags({
  page = 1,
  pageSize = 20,
  q,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (q && q.trim()) params.set("q", q.trim());

  return serverFetch<PagedResult<BlogTagOptionDto>>(
    `blog-tags/trash?${params.toString()}`
  );
}

export async function restoreBlogTag(id: string) {
  return serverFetch<void>(`blog-tags/${id}/restore`, { method: "POST" });
}

export async function hardDeleteBlogTag(id: string) {
  return serverFetch<void>(`blog-tags/${id}/hard`, { method: "DELETE" });
}
