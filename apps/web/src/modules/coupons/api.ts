import type { PagedResult } from "@/shared/types/adminlistpageTypes";
import { apiFetch } from "@/lib/api";
import type { CouponDto, CouponUpsertDto, CouponListItemDto } from "./types";

export async function listCoupons({
  page = 1,
  pageSize = 20,
  q,
  status,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: "active" | "inactive";
} = {}): Promise<PagedResult<CouponListItemDto>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  return apiFetch(`coupons?${params.toString()}`);
}

export async function getCoupon(id: string): Promise<CouponDto> {
  return apiFetch(`coupons/${id}`);
}

export async function createCoupon(dto: CouponUpsertDto): Promise<CouponDto> {
  return apiFetch(`coupons`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function updateCoupon(id: string, dto: CouponUpsertDto) {
  return apiFetch(`coupons/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function deleteCoupon(id: string) {
  return apiFetch(`coupons/${id}`, { method: "DELETE" });
}

// اگر Trash فعال داری:
export async function listCouponsTrash({
  page = 1,
  pageSize = 20,
  q,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
} = {}): Promise<PagedResult<CouponListItemDto>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (q) params.set("q", q);
  return apiFetch(`coupons/trash?${params.toString()}`);
}

export async function restoreCoupon(id: string) {
  return apiFetch(`coupons/${id}/restore`, { method: "POST" });
}

export async function hardDeleteCoupon(id: string) {
  return apiFetch(`coupons/${id}/hard`, { method: "DELETE" });
}
