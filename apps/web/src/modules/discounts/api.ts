import type { PagedResult } from "@/shared/types/adminlistpageTypes";
import { apiFetch } from "@/lib/api";
import type {
  DiscountDto,
  DiscountListItemDto,
  DiscountUpsertDto,
} from "./types";

export async function listDiscounts({
  page = 1,
  pageSize = 20,
  q,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
} = {}): Promise<PagedResult<DiscountListItemDto>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (q) params.set("q", q);
  return apiFetch(`discounts?${params.toString()}`);
}

export async function getDiscount(id: string): Promise<DiscountDto> {
  return apiFetch(`discounts/${id}`);
}

export async function createDiscount(
  dto: DiscountUpsertDto
): Promise<DiscountDto> {
  return apiFetch(`discounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function updateDiscount(id: string, dto: DiscountUpsertDto) {
  return apiFetch(`discounts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function deleteDiscount(id: string) {
  return apiFetch(`discounts/${id}`, { method: "DELETE" });
}

export async function listTrashDiscounts(params: {
  q?: string;
  page?: number;
  pageSize?: number;
}) {
  const { q, page = 1, pageSize = 20 } = params;

  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  qs.set("page", String(page));
  qs.set("pageSize", String(pageSize));

  return apiFetch<PagedResult<DiscountListItemDto>>(
    `discounts/trash?${qs.toString()}`
  );
}

export async function restoreDiscount(id: string) {
  return apiFetch<void>(`discounts/${id}/restore`, { method: "POST" });
}

export async function hardDeleteDiscount(id: string) {
  return apiFetch<void>(`discounts/${id}/hard`, { method: "DELETE" });
}
