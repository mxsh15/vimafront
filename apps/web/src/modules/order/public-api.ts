import type { OrderCreateDto, OrderDto } from "./types";
import { apiFetch } from "@/lib/api";

export async function createOrder(dto: OrderCreateDto) {
  return apiFetch<OrderDto>("orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function getMyActiveCart() {
  return apiFetch<OrderDto>("orders/cart", {
    method: "GET",
  });
}

export async function getMyOrder(id: string): Promise<OrderDto> {
  const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Get order failed (${res.status})`);
  }

  return (await res.json()) as OrderDto;
}
