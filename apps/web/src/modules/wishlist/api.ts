import { apiFetch } from "@/lib/api";
import type {
    ToggleWishlistDto,
    WishlistContainsDto,
    WishlistDto,
    WishlistToggleResultDto,
} from "./types";

export function getMyWishlist(): Promise<WishlistDto> {
    return apiFetch<WishlistDto>("wishlists/my-wishlist", { method: "GET" });
}

export function myWishlistContains(
    productId: string,
    vendorOfferId?: string | null
): Promise<WishlistContainsDto> {
    const qs = vendorOfferId ? `?vendorOfferId=${encodeURIComponent(vendorOfferId)}` : "";
    return apiFetch<WishlistContainsDto>(
        `wishlists/my-wishlist/contains/${encodeURIComponent(productId)}${qs}`,
        { method: "GET" }
    );
}

export function toggleMyWishlist(dto: ToggleWishlistDto): Promise<WishlistToggleResultDto> {
    return apiFetch<WishlistToggleResultDto>("wishlists/my-wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
}