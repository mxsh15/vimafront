import { apiFetch } from "@/lib/api";
import type {
  PagedResult,
  AdminCartListItemDto,
  AdminCartDetailDto,
} from "./types";

export async function listAdminCarts({
  page = 1,
  pageSize = 20,
  q,
}: { page?: number; pageSize?: number; q?: string } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q && q.trim()) params.set("q", q.trim());
  return serverFetch<PagedResult<AdminCartListItemDto>>(
    `admin/carts?${params.toString()}`
  );
}

export async function listDeletedAdminCarts({
  page = 1,
  pageSize = 20,
  q,
}: { page?: number; pageSize?: number; q?: string } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q && q.trim()) params.set("q", q.trim());
  return serverFetch<PagedResult<AdminCartListItemDto>>(
    `admin/carts/trash?${params.toString()}`
  );
}

export async function getAdminCart(id: string) {
  return serverFetch<AdminCartDetailDto>(`admin/carts/${id}`);
}

export async function deleteAdminCart(id: string) {
  return serverFetch<void>(`admin/carts/${id}`, { method: "DELETE" });
}

export async function restoreAdminCart(id: string) {
  return serverFetch<void>(`admin/carts/${id}/restore`, { method: "POST" });
}

export async function hardDeleteAdminCart(id: string) {
  return serverFetch<void>(`admin/carts/${id}/hard`, { method: "DELETE" });
}
