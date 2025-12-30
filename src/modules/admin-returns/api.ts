import { apiFetch } from "@/lib/api";
import type {
  PagedResult,
  AdminReturnListItemDto,
  AdminReturnDetailDto,
  AdminReturnReviewDto,
  AdminCreateRefundDto,
  ReturnStatus,
} from "./types";

export async function listAdminReturns({
  page = 1,
  pageSize = 20,
  q,
  status,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: ReturnStatus;
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q?.trim()) params.set("q", q.trim());
  if (status) params.set("status", status);
  return serverFetch<PagedResult<AdminReturnListItemDto>>(
    `admin/returns?${params.toString()}`
  );
}

export async function listAbandonedAdminReturns({
  page = 1,
  pageSize = 20,
  q,
  days = 7,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
  days?: number;
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    days: String(days),
  });
  if (q?.trim()) params.set("q", q.trim());
  return serverFetch<PagedResult<AdminReturnListItemDto>>(
    `admin/returns/abandoned?${params.toString()}`
  );
}

export async function listDeletedAdminReturns({
  page = 1,
  pageSize = 20,
  q,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q?.trim()) params.set("q", q.trim());
  return serverFetch<PagedResult<AdminReturnListItemDto>>(
    `admin/returns/trash?${params.toString()}`
  );
}

export async function getAdminReturn(id: string) {
  return serverFetch<AdminReturnDetailDto>(`admin/returns/${id}`);
}

export async function softDeleteAdminReturn(id: string) {
  return serverFetch<void>(`admin/returns/${id}`, { method: "DELETE" });
}

export async function restoreAdminReturn(id: string) {
  return serverFetch<void>(`admin/returns/${id}/restore`, { method: "POST" });
}

export async function hardDeleteAdminReturn(id: string) {
  return serverFetch<void>(`admin/returns/${id}/hard`, { method: "DELETE" });
}

export async function reviewAdminReturn(id: string, dto: AdminReturnReviewDto) {
  return serverFetch<void>(`admin/returns/${id}/review`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function completeAdminReturn(id: string, adminNotes?: string) {
  return serverFetch<void>(`admin/returns/${id}/complete`, {
    method: "POST",
    body: JSON.stringify(adminNotes ?? null),
  });
}

export async function createRefundForReturn(
  id: string,
  dto: AdminCreateRefundDto
) {
  return serverFetch<void>(`admin/returns/${id}/refund`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}
