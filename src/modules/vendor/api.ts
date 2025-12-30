import type {
  PagedResult,
  VendorDto,
  VendorListItemDto,
  VendorMemberDto,
} from "./types";
import type { VendorUpsertInput } from "./schemas";
import { apiFetch } from "@/lib/api";

// لیست فروشندگان
export async function listVendors({
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

  const url = `vendors?${params.toString()}`;
  return apiFetch<PagedResult<VendorListItemDto>>(url);
}

// گرفتن یک فروشنده
export async function getVendor(id: string) {
  return apiFetch<VendorDto>(`vendors/${id}`);
}

// ایجاد فروشنده
export async function createVendor(input: VendorUpsertInput) {
  return apiFetch<VendorDto>(`vendors`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// به روز رسانی
export async function updateVendor(id: string, input: VendorUpsertInput) {
  return apiFetch<VendorDto>(`vendors/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

// حذف نرم افزاری
export async function deleteVendor(id: string) {
  await apiFetch<void>(`vendors/${id}`, { method: "DELETE" });
}

// لیست سطل زباله
export async function listDeletedVendors({
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

  const url = `vendors/trash?${params.toString()}`;
  return apiFetch<PagedResult<VendorListItemDto>>(url);
}

// بازیابی
export async function restoreVendor(id: string) {
  return apiFetch(`vendors/${id}/restore`, { method: "POST" });
}

// حذف قطعی
export async function hardDeleteVendor(id: string) {
  return apiFetch(`vendors/${id}/hard`, { method: "DELETE" });
}

export async function listVendorOptions(): Promise<
  Array<{ id: string; title: string; storeName: string }>
> {
  const res = await listVendors({ page: 1, pageSize: 500, status: "active" });

  return res.items.map((v) => ({
    id: v.id,
    title: v.storeName,
    storeName: v.storeName,
  }));
}

export async function listMyVendors(): Promise<VendorListItemDto[]> {
  return apiFetch("vendors/my");
}

export async function listVendorMembers(
  vendorId: string
): Promise<VendorMemberDto[]> {
  return apiFetch(`vendors/${vendorId}/members`);
}

export async function addVendorMember(
  vendorId: string,
  userId: string,
  role: string
) {
  await apiFetch(`vendors/${vendorId}/members`, {
    method: "POST",
    body: JSON.stringify({ userId, role }),
  });
}

export async function removeVendorMember(vendorId: string, userId: string) {
  await apiFetch(`vendors/${vendorId}/members/${userId}`, {
    method: "DELETE",
  });
}
