"use client";

import { useQuery } from "@tanstack/react-query";
import { listPublicAmazingProducts } from "./api";

export function usePublicAmazingProducts(params?: { take?: number; categoryId?: string | null }) {
    const take = params?.take ?? 20;
    const categoryId = params?.categoryId ?? null;

    return useQuery({
        queryKey: ["public-amazing-products", take, categoryId],
        queryFn: () => listPublicAmazingProducts({ take, categoryId }),
    });
}
