import { apiFetch } from "@/lib/api";
import type {
  PagedResult,
  ShippingMethodListItemDto,
  ShippingMethodUpsertDto,
} from "./types";

export async function listShippingMethods(params: {
  page?: number;
  pageSize?: number;
  q?: string;
}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params.q) qs.set("q", params.q);

  return serverFetch<PagedResult<ShippingMethodListItemDto>>(
    `admin/shipping-methods?${qs.toString()}`
  );
}

export async function trashShippingMethods(params: {
  page?: number;
  pageSize?: number;
  q?: string;
}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params.q) qs.set("q", params.q);

  return serverFetch<PagedResult<ShippingMethodListItemDto>>(
    `admin/shipping-methods/trash?${qs.toString()}`
  );
}

export async function createShippingMethod(dto: ShippingMethodUpsertDto) {
  return serverFetch<void>("admin/shipping-methods", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function updateShippingMethod(
  id: string,
  dto: ShippingMethodUpsertDto
) {
  return serverFetch<void>(`admin/shipping-methods/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function deleteShippingMethod(id: string) {
  return serverFetch<void>(`admin/shipping-methods/${id}`, {
    method: "DELETE",
  });
}

export async function restoreShippingMethod(id: string) {
  return serverFetch<void>(`admin/shipping-methods/${id}/restore`, {
    method: "POST",
  });
}

export async function hardDeleteShippingMethod(id: string) {
  return serverFetch<void>(`admin/shipping-methods/${id}/hard`, {
    method: "DELETE",
  });
}
