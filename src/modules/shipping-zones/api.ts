import { apiFetch } from "@/lib/api";
import type {
  PagedResult,
  ShippingZoneListItemDto,
  ShippingZoneUpsertDto,
  ShippingZoneRateDto,
} from "./types";

export async function listShippingZones(params: {
  page?: number;
  pageSize?: number;
  q?: string;
}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params.q) qs.set("q", params.q);

  return serverFetch<PagedResult<ShippingZoneListItemDto>>(
    `admin/shipping-zones?${qs.toString()}`
  );
}

export async function createShippingZone(dto: ShippingZoneUpsertDto) {
  return serverFetch<void>("admin/shipping-zones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function updateShippingZone(
  id: string,
  dto: ShippingZoneUpsertDto
) {
  return serverFetch<void>(`admin/shipping-zones/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function deleteShippingZone(id: string) {
  return serverFetch<void>(`admin/shipping-zones/${id}`, { method: "DELETE" });
}

// Rates
export async function getShippingZoneRates(zoneId: string) {
  return serverFetch<ShippingZoneRateDto[]>(
    `admin/shipping-zones/${zoneId}/rates`
  );
}

export async function upsertShippingZoneRates(
  zoneId: string,
  rates: ShippingZoneRateDto[]
) {
  return serverFetch<void>(`admin/shipping-zones/${zoneId}/rates`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rates),
  });
}
