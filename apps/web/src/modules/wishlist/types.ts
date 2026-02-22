export type WishlistItemDto = {
    id: string;
    productId: string;
    productTitle: string;
    productSlug: string;
    productImageUrl?: string | null;
    vendorOfferId?: string | null;
    price?: number | null;
};

export type WishlistDto = {
    id: string;
    userId: string;
    name?: string | null;
    isDefault: boolean;
    items: WishlistItemDto[];
    createdAtUtc: string;
};

export type WishlistContainsDto = {
    isInWishlist: boolean;
};

export type ToggleWishlistDto = {
    productId: string;
    vendorOfferId?: string | null;
};

export type WishlistToggleResultDto = {
    isInWishlist: boolean;
};