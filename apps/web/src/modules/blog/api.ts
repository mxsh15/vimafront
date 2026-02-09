import { apiFetch } from "@/lib/api";
import type { PagedResult } from "@/shared/types/adminlistpageTypes";
import type {
  BlogPostListItemDto,
  BlogPostDto,
  BlogPostUpsertInput,
} from "./types";
import { UserOptionDto2 } from "../user/types";

export async function listBlogPosts({
  page = 1,
  pageSize = 20,
  q,
  categoryId,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
  categoryId?: string;
}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (q && q.trim()) params.set("q", q.trim());
  if (categoryId) params.set("categoryId", categoryId);

  const url = `blog-posts?${params.toString()}`;
  return apiFetch<PagedResult<BlogPostListItemDto>>(url);
}

export async function getBlogPost(id: string) {
  return apiFetch<BlogPostDto>(`blog-posts/${id}`);
}

export async function createBlogPost(payload: BlogPostUpsertInput) {
  return apiFetch<BlogPostDto>("blog-posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateBlogPost(id: string, payload: BlogPostUpsertInput) {
  return apiFetch<void>(`blog-posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteBlogPost(id: string) {
  return apiFetch<void>(`blog-posts/${id}`, { method: "DELETE" });
}

export async function listDeletedBlogPosts({
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

  const url = `blog-posts/trash?${params.toString()}`;
  return apiFetch<PagedResult<BlogPostListItemDto>>(url);
}

export async function restoreBlogPost(id: string) {
  return apiFetch(`blog-posts/${id}/restore`, { method: "POST" });
}

export async function hardDeleteBlogPost(id: string) {
  return apiFetch(`blog-posts/${id}/hard`, { method: "DELETE" });
}

export async function listUserOptions() {
  return apiFetch<UserOptionDto2[]>("users/options");
}
