import type { UserUpsertInput } from "@/modules/user/schemas";
import type { PagedResult } from "@/modules/brand/types";
import type { UserRow } from "./types";
import { apiFetch } from "@/lib/api";

export async function listUsers(params: {
  page: number;
  pageSize: number;
  q?: string;
  role?: string;
  status?: string;
}): Promise<PagedResult<UserRow>> {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("pageSize", String(params.pageSize));
  if (params.q?.trim()) sp.set("q", params.q.trim());
  if (params.role?.trim()) sp.set("role", params.role.trim());
  if (params.status?.trim()) sp.set("status", params.status.trim());

  return apiFetch<PagedResult<UserRow>>(`users?${sp.toString()}`, {
    next: { tags: ["users"] },
  });
}

export async function listDeletedUsers(params: {
  page: number;
  pageSize: number;
  q?: string;
}): Promise<PagedResult<UserRow>> {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("pageSize", String(params.pageSize));
  if (params.q?.trim()) sp.set("q", params.q.trim());

  return apiFetch<PagedResult<UserRow>>(`users/trash?${sp.toString()}`, {
    next: { tags: ["users:trash"] },
  });
}

export async function createUser(payload: UserUpsertInput) {
  return apiFetch<void>("users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateUser(id: string, payload: UserUpsertInput) {
  return apiFetch<void>(`users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(id: string) {
  return apiFetch<void>(`users/${id}`, {
    method: "DELETE",
  });
}

export async function restoreUser(id: string) {
  return apiFetch<void>(`users/${id}/restore`, { method: "POST" });
}

export async function hardDeleteUser(id: string) {
  return apiFetch<void>(`users/${id}/hard`, { method: "DELETE" });
}


export type UserOptionDto = {
  id: string;
  name: string;
  email?: string | null;
};


export async function listUserOptions(): Promise<UserOptionDto[]> {
  return apiFetch<UserOptionDto[]>("users/options", {
    next: { tags: ["users:options"] },
  });
}

export async function searchUserOptions(params: {
  q?: string;
  onlyActive?: boolean;
}): Promise<UserOptionDto[]> {
  const sp = new URLSearchParams();
  if (params.q?.trim()) sp.set("q", params.q.trim());
  if (params.onlyActive === false) sp.set("onlyActive", "false");

  const qs = sp.toString();
  return apiFetch<UserOptionDto[]>(`users/search${qs ? `?${qs}` : ""}`, {
    next: { tags: ["users:options"] },
  });
}