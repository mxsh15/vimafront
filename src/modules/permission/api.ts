import type { PagedResult, PermissionDto, PermissionListItemDto, PermissionOptionDto } from "./types";
import type { PermissionUpsertInput } from "./schemas";
import { apiFetch } from "@/lib/api";

// لیست دسترسی‌ها
export async function listPermissions({
  page = 1,
  pageSize = 20,
  q,
  category,
  status,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
  category?: string;
  status?: string;
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (q && q.trim()) params.set("q", q.trim());
  if (category && category.trim()) params.set("category", category.trim());
  if (status && status.trim()) params.set("status", status.trim());

  const url = `permissions?${params.toString()}`;
  return apiFetch<PagedResult<PermissionListItemDto>>(url);
}

// گرفتن یک دسترسی
export async function getPermission(id: string) {
  return apiFetch<PermissionDto>(`permissions/${id}`);
}

// ایجاد دسترسی
export async function createPermission(input: PermissionUpsertInput) {
  return apiFetch<PermissionDto>(`permissions`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// به روز رسانی
export async function updatePermission(id: string, input: PermissionUpsertInput) {
  return apiFetch<PermissionDto>(`permissions/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

// حذف نرم افزاری
export async function deletePermission(id: string) {
  await apiFetch<void>(`permissions/${id}`, { method: "DELETE" });
}

// لیست دسته‌بندی‌ها
export async function getPermissionCategories() {
  return apiFetch<string[]>(`permissions/categories`);
}

// لیست سطل زباله
export async function listDeletedPermissions({
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

  const url = `permissions/trash?${params.toString()}`;
  return apiFetch<PagedResult<PermissionListItemDto>>(url);
}

// بازیابی
export async function restorePermission(id: string) {
  return apiFetch(`permissions/${id}/restore`, { method: "POST" });
}

// حذف قطعی
export async function hardDeletePermission(id: string) {
  return apiFetch(`permissions/${id}/hard`, { method: "DELETE" });
}

// لیست همه دسترسی‌ها برای انتخاب در نقش
export async function listPermissionOptions(): Promise<PermissionOptionDto[]> {
  const res = await listPermissions({ page: 1, pageSize: 1000, status: "active" });

  return res.items.map((p) => ({
    id: p.id,
    name: p.name,
    displayName: p.displayName,
    category: p.category,
  }));
}

