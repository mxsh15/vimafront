import { apiFetch } from "@/lib/api";
import type {
  PagedResult,
  AdminWishlistListItemDto,
  AdminWishlistDetailDto,
  AdminWishlistTopProductDto,
} from "./types";

export async function listAdminWishlists({
  page = 1,
  pageSize = 20,
  q,
}: { page?: number; pageSize?: number; q?: string } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q?.trim()) params.set("q", q.trim());
  return serverFetch<PagedResult<AdminWishlistListItemDto>>(
    `admin/wishlists?${params.toString()}`
  );
}

export async function getAdminWishlist(id: string) {
  return serverFetch<AdminWishlistDetailDto>(`admin/wishlists/${id}`);
}

export async function deleteAdminWishlist(id: string) {
  return serverFetch<void>(`admin/wishlists/${id}`, { method: "DELETE" });
}

export async function listAdminWishlistsTrash({
  page = 1,
  pageSize = 20,
  q,
}: { page?: number; pageSize?: number; q?: string } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q?.trim()) params.set("q", q.trim());
  return serverFetch<PagedResult<AdminWishlistListItemDto>>(
    `admin/wishlists/trash?${params.toString()}`
  );
}

export async function restoreAdminWishlist(id: string) {
  return serverFetch<void>(`admin/wishlists/${id}/restore`, { method: "POST" });
}

export async function hardDeleteAdminWishlist(id: string) {
  return serverFetch<void>(`admin/wishlists/${id}/hard`, { method: "DELETE" });
}

export async function topWishlistProducts(take = 50) {
  const params = new URLSearchParams({ take: String(take) });
  return serverFetch<AdminWishlistTopProductDto[]>(
    `admin/wishlists/top-products?${params.toString()}`
  );
}
