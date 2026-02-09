import { apiFetch } from "@/lib/api";
import type {
  PagedResult,
  AdminShippingAddressListItemDto,
  AdminShippingAddressDetailDto,
} from "./types";

export async function listAdminShippingAddresses({
  page = 1,
  pageSize = 20,
  q,
  mode,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
  mode?: "all" | "used" | "unused";
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q?.trim()) params.set("q", q.trim());
  if (mode && mode !== "all") params.set("mode", mode);
  return serverFetch<PagedResult<AdminShippingAddressListItemDto>>(
    `admin/shipping-addresses?${params.toString()}`
  );
}

export async function listAbandonedAdminShippingAddresses({
  page = 1,
  pageSize = 20,
  q,
  days = 30,
}: { page?: number; pageSize?: number; q?: string; days?: number } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    days: String(days),
  });
  if (q?.trim()) params.set("q", q.trim());
  return serverFetch<PagedResult<AdminShippingAddressListItemDto>>(
    `admin/shipping-addresses/abandoned?${params.toString()}`
  );
}

export async function listDeletedAdminShippingAddresses({
  page = 1,
  pageSize = 20,
  q,
}: { page?: number; pageSize?: number; q?: string } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q?.trim()) params.set("q", q.trim());
  return serverFetch<PagedResult<AdminShippingAddressListItemDto>>(
    `admin/shipping-addresses/trash?${params.toString()}`
  );
}

export async function getAdminShippingAddress(id: string) {
  return serverFetch<AdminShippingAddressDetailDto>(
    `admin/shipping-addresses/${id}`
  );
}

export async function deleteAdminShippingAddress(id: string) {
  return serverFetch<void>(`admin/shipping-addresses/${id}`, {
    method: "DELETE",
  });
}

export async function restoreAdminShippingAddress(id: string) {
  return serverFetch<void>(`admin/shipping-addresses/${id}/restore`, {
    method: "POST",
  });
}

export async function hardDeleteAdminShippingAddress(id: string) {
  return serverFetch<void>(`admin/shipping-addresses/${id}/hard`, {
    method: "DELETE",
  });
}
