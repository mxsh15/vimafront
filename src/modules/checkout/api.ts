import { apiFetch } from "@/lib/api";
import { ShippingOptionDto } from "./types";

export async function listShippingOptions(addressId: string) {
  const params = new URLSearchParams({ addressId });
  return apiFetch<ShippingOptionDto[]>(
    `checkout/shipping-options?${params.toString()}`
  );
}
