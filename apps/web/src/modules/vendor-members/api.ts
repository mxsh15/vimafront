import { apiFetch } from "@/lib/api";
import type {
  AddVendorMemberDto,
  UpdateVendorMemberDto,
  VendorMemberListItemDto,
} from "./types";

export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export function listVendorMembers(params: {
  vendorId: string;
  page?: number;
  pageSize?: number;
  q?: string;
  isActive?: string; // "active" | "inactive" | undefined (برای هماهنگی با StatusFilter)
  role?: string;
}) {
  const { vendorId, page = 1, pageSize = 12, q = "", isActive, role } = params;

  const qs = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (q?.trim()) qs.set("q", q.trim());

  // تبدیل status string به bool? بک‌اند
  if (isActive === "active") qs.set("isActive", "true");
  if (isActive === "inactive") qs.set("isActive", "false");

  if (role?.trim()) qs.set("role", role.trim());

  return apiFetch<PagedResult<VendorMemberListItemDto>>(
    `vendors/${vendorId}/members?${qs.toString()}`
  );
}

export function addVendorMember(vendorId: string, dto: AddVendorMemberDto) {
  return apiFetch<{ id: string; revived?: boolean }>(
    `vendors/${vendorId}/members`,
    { method: "POST", body: JSON.stringify(dto) }
  );
}

export function updateVendorMember(
  vendorId: string,
  memberId: string,
  dto: UpdateVendorMemberDto
) {
  return apiFetch<void>(`vendors/${vendorId}/members/${memberId}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

export function removeVendorMember(vendorId: string, memberId: string) {
  return apiFetch<void>(`vendors/${vendorId}/members/${memberId}`, {
    method: "DELETE",
  });
}
