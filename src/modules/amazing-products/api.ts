import { apiFetch } from "@/lib/api";

export type PublicAmazingProduct = {
    id: string;
    title: string;
    imageUrl: string | null;
    price: number;          
    oldPrice: number | null;
    discountPercent: number | null;
};

export function listPublicAmazingProducts(take = 20) {
    const sp = new URLSearchParams({ take: String(take) });
    return apiFetch<PublicAmazingProduct[]>(`public/amazing-products?${sp.toString()}`);
}
