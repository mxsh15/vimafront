import type {
  PagedResult,
  UserDto,
  UserListItemDto,
  UserOptionDto,
} from "./types";
import type { UserUpsertInput } from "./schemas";
import { apiFetch } from "@/lib/api";

// لیست کاربران
export async function listUsers({
  page = 1,
  pageSize = 20,
  q,
  role,
  status,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
  role?: string;
  status?: string;
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (q && q.trim()) params.set("q", q.trim());
  if (role && role.trim()) params.set("role", role.trim());
  if (status && status.trim()) params.set("status", status.trim());

  const url = `users?${params.toString()}`;
  return apiFetch<PagedResult<UserListItemDto>>(url);
}

// گرفتن یک کاربر
// export async function getUser(id: string): Promise<UserDto> {
//   return apiFetch<UserDto>(`users/${id}`, { method: "GET" });
// }

// ایجاد کاربر
export async function createUser(input: UserUpsertInput) {
  return apiFetch<UserDto>(`users`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// به روز رسانی
export async function updateUser(id: string, input: UserUpsertInput) {
  return apiFetch<UserDto>(`users/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

// حذف نرم افزاری
export async function deleteUser(id: string) {
  await apiFetch<void>(`users/${id}`, { method: "DELETE" });
}

// لیست سطل زباله
export async function listDeletedUsers({
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

  const url = `users/trash?${params.toString()}`;
  return serverFetch<PagedResult<UserListItemDto>>(url);
}

// بازیابی
export async function restoreUser(id: string) {
  return apiFetch(`users/${id}/restore`, { method: "POST" });
}

// حذف قطعی
export async function hardDeleteUser(id: string) {
  return apiFetch(`users/${id}/hard`, { method: "DELETE" });
}

export async function listUserOptions(): Promise<UserOptionDto[]> {
  const res = await listUsers({
    page: 1,
    pageSize: 500,
    status: "active",
  });

  return res.items.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
  }));
}
