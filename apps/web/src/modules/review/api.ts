import type { PagedResult } from "@/shared/types/adminlistpageTypes";
import type { ReviewDto } from "./types";
import { apiFetch } from "@/lib/api";
import { serverFetch } from "@/lib/server/http";

export async function getProductReviews(productId: string): Promise<ReviewDto[]> {
  return apiFetch<ReviewDto[]>(`reviews/products/${productId}`);
}

export async function submitReview(input: {
  productId: string;
  rating: number;
  comment: string;
  title?: string | null;
  orderItemId?: string | null;
}): Promise<ReviewDto> {
  return apiFetch<ReviewDto>("reviews/submit", {
    method: "POST",
    body: JSON.stringify({
      productId: input.productId,
      rating: input.rating,
      title: input.title ?? null,
      comment: input.comment,
      orderItemId: input.orderItemId ?? null,
    }),
  });
}

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
  if (typeof isApproved === "boolean") params.set("isApproved", String(isApproved));
  if (productId) params.set("productId", productId);

  return apiFetch<PagedResult<ReviewDto>>(`reviews?${params.toString()}`);
}

export async function approveReview(id: string) {
  return serverFetch<void>(`reviews/${id}/approve`, { method: "PUT" });
}

export async function deleteReview(id: string) {
  return serverFetch<void>(`reviews/${id}`, { method: "DELETE" });
}

export async function rejectReview(id: string) {
  return serverFetch<void>(`reviews/${id}/reject`, {
    method: "PUT",
  });
}

export async function voteReview(reviewId: string, value: 1 | -1 | 0) {
  return apiFetch<{ likeCount: number; dislikeCount: number; userVote: number }>(
    `reviews/${reviewId}/vote`,
    {
      method: "POST",
      body: JSON.stringify({ value }),
    }
  );
}