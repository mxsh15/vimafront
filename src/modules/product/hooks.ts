"use client";

import { useQuery } from "@tanstack/react-query";
import { listProducts, listDeletedProducts } from "./api";
import type { PagedResult, ProductListItemDto } from "./types";

export function useProducts(
  params: { page: number; pageSize: number; q: string },
  initialData?: PagedResult<ProductListItemDto>
) {
  return useQuery({
    queryKey: ["products", params] as const,
    queryFn: () => listProducts(params),
    initialData,
  });
}

export function useDeletedProducts(
  params: { page: number; pageSize: number; q: string },
  initialData?: PagedResult<ProductListItemDto>
) {
  return useQuery({
    queryKey: ["products", "trash", params] as const,
    queryFn: () => listDeletedProducts(params),
    initialData,
  });
}
