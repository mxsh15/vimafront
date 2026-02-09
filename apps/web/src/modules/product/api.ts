import { apiFetch } from "@/lib/api";
import type {
  PagedResult,
  ProductListItemDto,
  ProductDto,
  ProductUpsertInput,
  PublicBestSellingProduct,
  PublicCategoryProduct,
} from "./types";

export async function listProducts({
  page = 1,
  pageSize = 20,
  q,
  brandId,
  status,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
  brandId?: string;
  status?: string;
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (q && q.trim()) params.set("q", q.trim());
  if (brandId) params.set("brandId", brandId);
  if (status) params.set("status", status);

  return apiFetch<PagedResult<ProductListItemDto>>(
    `products?${params.toString()}`
  );
}

export async function getProduct(id: string) {
  return apiFetch<ProductDto>(`products/${id}`);
}

export async function createProduct(input: ProductUpsertInput) {
  return apiFetch<ProductDto>("products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateProduct(id: string, input: ProductUpsertInput) {
  return apiFetch<ProductDto>(`products/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteProduct(id: string) {
  await apiFetch<void>(`products/${id}`, { method: "DELETE" });
}

// لیست سطل زباله
export async function listDeletedProducts({
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

  if (q && q.trim()) params.set("q", q.trim());

  const url = `products/trash?${params.toString()}`;
  return apiFetch<PagedResult<ProductListItemDto>>(url);
}

// بازیابی
export async function restoreProduct(id: string) {
  return apiFetch(`products/${id}/restore`, { method: "POST" });
}

// حذف قطعی
export async function hardDeleteProduct(id: string) {
  return apiFetch(`products/${id}/hard`, { method: "DELETE" });
}


export function listPublicBestSellingProducts(params?: { take?: number }) {
  const take = params?.take ?? 18;
  const sp = new URLSearchParams({ take: String(take) });
  return apiFetch<PublicBestSellingProduct[]>(`public/best-selling-products?${sp.toString()}`);
}


export function listPublicCategoryProducts(params: { take: number; categoryIds: string[] }) {
  const take = params.take ?? 12;
  const sp = new URLSearchParams();
  sp.set("take", String(take));
  const ids = (params.categoryIds ?? []).map(x => x.trim()).filter(Boolean).sort();
  for (const id of ids) sp.append("categoryIds", id);
  return apiFetch<PublicCategoryProduct[]>(`public/category-products?${sp.toString()}`);
}