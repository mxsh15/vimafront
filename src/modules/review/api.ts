import type { PagedResult } from "@/shared/types/adminlistpageTypes";
import type { ReviewDto } from "./types";
import { apiFetch } from "@/lib/api";

export async function listReviews({
  page = 1,
  pageSize = 20,
  q,
  isApproved,
  productId,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
  isApproved?: boolean;
  productId?: string;
} = {}): Promise<PagedResult<ReviewDto>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (q) params.set("q", q);
  if (typeof isApproved === "boolean")
    params.set("isApproved", String(isApproved));
  if (productId) params.set("productId", productId);

  return apiFetch<PagedResult<ReviewDto>>(`reviews?${params.toString()}`);
}

export async function approveReview(id: string) {
  return serverFetch<void>(`reviews/${id}/approve`, { method: "PUT" });
}

export async function deleteReview(id: string) {
  return serverFetch<void>(`reviews/${id}`, { method: "DELETE" });
}
