import { apiFetch } from "@/lib/api";
import type {
  PagedResult,
  AdminVendorOfferListItemDto,
  AdminOfferModerationDto,
  AdminPriceDiscrepancyRowDto,
  VendorOfferStatus,
  AdminVendorOfferModerationLogDto,
  AdminVendorOfferDetailDto,
} from "./types";

export async function listAdminVendorOffers({
  page = 1,
  pageSize = 20,
  q,
  status,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: VendorOfferStatus;
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q?.trim()) params.set("q", q.trim());
  if (status) params.set("status", status);
  return serverFetch<PagedResult<AdminVendorOfferListItemDto>>(
    `admin/vendor-offers?${params.toString()}`
  );
}

export async function listAdminVendorOffersTrash({
  page = 1,
  pageSize = 20,
  q,
}: { page?: number; pageSize?: number; q?: string } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q?.trim()) params.set("q", q.trim());
  return serverFetch<PagedResult<AdminVendorOfferListItemDto>>(
    `admin/vendor-offers/trash?${params.toString()}`
  );
}

export async function approveOffer(id: string, dto: AdminOfferModerationDto) {
  return serverFetch<void>(`admin/vendor-offers/${id}/approve`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}
export async function rejectOffer(id: string, dto: AdminOfferModerationDto) {
  return serverFetch<void>(`admin/vendor-offers/${id}/reject`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}
export async function disableOffer(id: string, dto: AdminOfferModerationDto) {
  return serverFetch<void>(`admin/vendor-offers/${id}/disable`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}
export async function enableOffer(id: string, dto: AdminOfferModerationDto) {
  return serverFetch<void>(`admin/vendor-offers/${id}/enable`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function deleteOffer(id: string) {
  return serverFetch<void>(`admin/vendor-offers/${id}`, { method: "DELETE" });
}
export async function restoreOffer(id: string) {
  return serverFetch<void>(`admin/vendor-offers/${id}/restore`, {
    method: "POST",
  });
}
export async function hardDeleteOffer(id: string) {
  return serverFetch<void>(`admin/vendor-offers/${id}/hard`, {
    method: "DELETE",
  });
}

export async function listPriceDiscrepancies({
  page = 1,
  pageSize = 20,
  q,
  minOffers = 2,
  thresholdPercent = 30,
  onlyApproved = true,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
  minOffers?: number;
  thresholdPercent?: number;
  onlyApproved?: boolean;
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    minOffers: String(minOffers),
    thresholdPercent: String(thresholdPercent),
    onlyApproved: String(onlyApproved),
  });
  if (q?.trim()) params.set("q", q.trim());
  return serverFetch<PagedResult<AdminPriceDiscrepancyRowDto>>(
    `admin/vendor-offers/price-discrepancies?${params.toString()}`
  );
}

export async function getAdminVendorOffer(id: string) {
  return serverFetch<AdminVendorOfferDetailDto>(`admin/vendor-offers/${id}`);
}

export async function listAdminVendorOfferModerationLogs(id: string) {
  return serverFetch<AdminVendorOfferModerationLogDto[]>(
    `admin/vendor-offers/${id}/moderation-logs`
  );
}
