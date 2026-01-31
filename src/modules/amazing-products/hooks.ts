"use client";

import { useQuery } from "@tanstack/react-query";
import { listPublicAmazingProducts } from "./api";

export function usePublicAmazingProducts(take = 20) {
    return useQuery({
        queryKey: ["amazing-products", take],
        queryFn: () => listPublicAmazingProducts(take),
        staleTime: 1000 * 60 * 3,
    });
}
