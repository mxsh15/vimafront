import { apiFetch } from "@/lib/api";
import type { CartDto, AddToCartDto, UpdateCartItemDto } from "./types";

export async function getMyCart() {
  return apiFetch<CartDto>("carts/my-cart");
}

export async function addToCart(dto: AddToCartDto) {
  return apiFetch<CartDto>("carts/items", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function updateCartItem(id: string, dto: UpdateCartItemDto) {
  return apiFetch<CartDto>(`carts/items/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

export async function removeFromCart(id: string) {
  return apiFetch<void>(`carts/items/${id}`, {
    method: "DELETE",
  });
}

export async function clearCart() {
  return apiFetch<void>("carts/clear", {
    method: "DELETE",
  });
}

