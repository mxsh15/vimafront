import type { PagedResult, BrandDto, BrandListItemDto, BrandOptionDto, BrandPublicOptionDto } from "./types";
import type { BrandUpsertInput } from "./schemas";
import { apiFetch } from "@/lib/api";

// لیست برندها
export async function listBrands({
  page = 1,
  pageSize = 20,
  q,
  status,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (q && q.trim()) params.set("q", q.trim());
  if (status && status.trim()) params.set("status", status.trim());

  const url = `brands?${params.toString()}`;
  return apiFetch<PagedResult<BrandListItemDto>>(url);
}

// گرفتن یک برند
export async function getBrand(id: string) {
  return apiFetch<BrandDto>(`brands/${id}`);
}

// ایجاد برند
export async function createBrand(input: BrandUpsertInput) {
  return apiFetch<BrandDto>(`brands`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// به روز رسانی
export async function updateBrand(id: string, input: BrandUpsertInput) {
  return apiFetch<BrandDto>(`brands/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

// حذف نرم افزاری
export async function deleteBrand(id: string) {
  await apiFetch<void>(`brands/${id}`, { method: "DELETE" });
}

// لیست سطل زباله
export async function listDeletedBrands({
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

  const url = `brands/trash?${params.toString()}`;
  return apiFetch<PagedResult<BrandListItemDto>>(url);
}

// بازیابی
export async function restoreBrand(id: string) {
  return apiFetch(`brands/${id}/restore`, { method: "POST" });
}

// حذف قطعی
export async function hardDeleteBrand(id: string) {
  return apiFetch(`brands/${id}/hard`, { method: "DELETE" });
}


export async function listBrandOptions(): Promise<BrandOptionDto[]> {
  const res = await listBrands({ page: 1, pageSize: 500, status: "active" });

  return res.items.map((b) => ({
    id: b.id,
    title: b.title,
  }));
}

export async function listPublicBrandOptions(): Promise<BrandPublicOptionDto[]> {
  return apiFetch(`public/brands/options`, { method: "GET" });
}