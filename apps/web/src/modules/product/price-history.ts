import { apiFetch } from "@/lib/api";

export type PriceHistoryOfferDto = {
    vendorId: string;
    vendorName: string;
    price: number;
    discountPrice: number | null;
    effectivePrice: number;
};

export type PriceHistoryPointDto = {
    date: string; // yyyy-MM-dd
    maxEffectivePrice: number;
    maxVendorId: string | null;
    maxVendorName: string | null;
    offers: PriceHistoryOfferDto[];
};

export type ProductPriceHistoryDto = {
    productId: string;
    points: PriceHistoryPointDto[];
};

export async function getProductPriceHistory(productId: string, days = 180) {
    const params = new URLSearchParams({ days: String(days) });
    return apiFetch<ProductPriceHistoryDto>(`store/${productId}/price-history?${params.toString()}`);
}