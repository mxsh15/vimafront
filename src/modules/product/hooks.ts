"use client";

import { useQuery } from "@tanstack/react-query";
import { listProducts, listDeletedProducts, listPublicBestSellingProducts, listPublicCategoryProducts } from "./api";
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


export function usePublicBestSellingProducts(take = 18) {
  return useQuery({
    queryKey: ["public-best-selling-products", take] as const,
    queryFn: () => listPublicBestSellingProducts({ take }),
  });
}


export function usePublicCategoryProducts(params: { take: number; categoryIds: string[] }) {
  const take = params.take ?? 12;
  const ids = (params.categoryIds ?? []).map(x => x.trim()).filter(Boolean).sort();
  const key = ids.join("|");

  return useQuery({
    queryKey: ["public-category-products", take, key],
    queryFn: () => listPublicCategoryProducts({ take, categoryIds: ids }),
    enabled: ids.length > 0,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
}