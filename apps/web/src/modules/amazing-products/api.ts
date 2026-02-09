import { apiFetch } from "@/lib/api";

export type PublicAmazingProduct = {
    id: string;
    title: string;
    imageUrl: string | null;
    price: number;
    oldPrice: number | null;
    discountPercent: number | null;
};

export function listPublicAmazingProducts(params?: { take?: number; categoryId?: string | null }) {
    const take = params?.take ?? 20;
    const sp = new URLSearchParams({ take: String(take) });

    if (params?.categoryId) sp.set("categoryId", params.categoryId);

    return apiFetch<PublicAmazingProduct[]>(`public/amazing-products?${sp.toString()}`);
}
