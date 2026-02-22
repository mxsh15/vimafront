import { apiFetch } from "@/lib/api";
import type { PagedResult, PublicProductCardDto } from "@/modules/product/types";
import type { CompareRequestDto, PublicCompareResponseDto } from "./types";

export function listProductsByCategory(params: {
    categoryId: string;
    page?: number;
    pageSize?: number;
    q?: string;
}): Promise<PagedResult<PublicProductCardDto>> {
    const qs = new URLSearchParams();
    qs.set("page", String(params.page ?? 1));
    qs.set("pageSize", String(params.pageSize ?? 12));
    if (params.q?.trim()) qs.set("q", params.q.trim());

    return apiFetch<PagedResult<PublicProductCardDto>>(
        `store/products/by-category/${encodeURIComponent(params.categoryId)}?${qs.toString()}`,
        { method: "GET" }
    );
}

export function getCompareData(productIds: string[]): Promise<PublicCompareResponseDto> {
    const body: CompareRequestDto = { productIds: (productIds ?? []).slice(0, 4) };
    return apiFetch<PublicCompareResponseDto>("store/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}