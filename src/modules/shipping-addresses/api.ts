import { apiFetch } from "@/lib/api";
import type { ShippingAddressCreateDto, ShippingAddressDto } from "./types";

export async function listMyShippingAddresses(): Promise<ShippingAddressDto[]> {
  return apiFetch<ShippingAddressDto[]>("shipping-addresses", {
    method: "GET",
  });
}

export async function createShippingAddress(
  dto: ShippingAddressCreateDto
): Promise<ShippingAddressDto> {
  return apiFetch<ShippingAddressDto>("shipping-addresses", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function deleteShippingAddress(id: string): Promise<void> {
  return apiFetch<void>(`shipping-addresses/${id}`, { method: "DELETE" });
}
