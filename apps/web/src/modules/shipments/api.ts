import type { PagedResult } from "@/shared/types/adminlistpageTypes";
import type { ShipmentRow, ShippingStatus, ShippingUpsertDto } from "./types";
import { apiFetch } from "@/lib/api";

export async function listShipments({
  page = 1,
  pageSize = 20,
  q,
  status,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: ShippingStatus;
} = {}): Promise<PagedResult<ShipmentRow>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (q) params.set("q", q);
  if (status) params.set("status", status);

  return apiFetch<PagedResult<ShipmentRow>>(
    `shipments?${params.toString()}`
  );
}

export async function upsertShipmentByOrder(
  orderId: string,
  dto: ShippingUpsertDto
) {
  return apiFetch<void>(`shipments/by-order/${orderId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}
