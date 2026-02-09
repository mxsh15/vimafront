"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyCart } from "./api";
import type { CartDto } from "./types";

export const MY_CART_QUERY_KEY = ["my-cart"];

export function useMyCartQuery(initialData?: CartDto | null) {
    return useQuery({
        queryKey: MY_CART_QUERY_KEY,
        queryFn: getMyCart,
        staleTime: 10_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, err: any) => {
            const status = err?.status || err?.cause?.status;
            if (status === 401) return false;
            return failureCount < 1;
        },
        ...(initialData ? { initialData } : {}),
    });
}
