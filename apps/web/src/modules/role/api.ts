import type { PagedResult, RoleDto, RoleListItemDto, RoleDetailDto, RoleOptionDto } from "./types";
import type { RoleUpsertInput } from "./schemas";
import { apiFetch } from "@/lib/api";

// لیست نقش‌ها
export async function listRoles({
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

  const url = `roles?${params.toString()}`;
  return apiFetch<PagedResult<RoleListItemDto>>(url);
}

// ایجاد نقش
export async function createRole(input: RoleUpsertInput) {
  return apiFetch<RoleDto>(`roles`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// به روز رسانی
export async function updateRole(id: string, input: RoleUpsertInput) {
  return apiFetch<RoleDto>(`roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

// حذف نرم افزاری
export async function deleteRole(id: string) {
  await apiFetch<void>(`roles/${id}`, { method: "DELETE" });
}

// لیست سطل زباله
export async function listDeletedRoles({
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

  const url = `roles/trash?${params.toString()}`;
  return apiFetch<PagedResult<RoleListItemDto>>(url);
}

// بازیابی
export async function restoreRole(id: string) {
  return apiFetch(`roles/${id}/restore`, { method: "POST" });
}

// حذف قطعی
export async function hardDeleteRole(id: string) {
  return apiFetch(`roles/${id}/hard`, { method: "DELETE" });
}

// لیست گزینه‌های نقش برای dropdown
export async function listRoleOptions(): Promise<RoleOptionDto[]> {
  const res = await listRoles({ page: 1, pageSize: 500, status: "active" });

  return res.items.map((r) => ({
    id: r.id,
    name: r.name,
  }));
}

