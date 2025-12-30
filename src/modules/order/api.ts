import type { PagedResult } from "@/shared/types/adminlistpageTypes";
import type {
  OrderCreateDto,
  OrderDto,
  OrderRow,
  OrderStatus,
  OrderStatusUpdateDto,
} from "./types";
import { apiFetch } from "@/lib/api";

export async function listOrders({
  page = 1,
  pageSize = 20,
  q,
  status,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: OrderStatus;
} = {}): Promise<PagedResult<OrderRow>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  return apiFetch<PagedResult<OrderRow>>(`orders?${params.toString()}`);
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const body: OrderStatusUpdateDto = { status };

  return apiFetch<void>(`orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function createOrder(dto: OrderCreateDto) {
  return apiFetch<OrderDto>("orders", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function getOrder(orderId: string): Promise<OrderDto> {
  return apiFetch<OrderDto>(`orders/${orderId}`, {
    method: "GET",
  });
}
