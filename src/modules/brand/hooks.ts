"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/react-query/keys";
import type { PagedResult } from "./types";
import type { BrandListItemDto } from "./types";
import { listBrands, listDeletedBrands } from "./api";

export function useBrands(
  params: { page: number; pageSize: number; q: string; status?: string },
  initialData?: PagedResult<BrandListItemDto>
) {
  return useQuery({
    queryKey: qk.brands({
      page: params.page,
      pageSize: params.pageSize,
      q: params.q,
      ...(params.status ? { status: params.status } : {}),
    } as any),
    queryFn: () => listBrands(params as any),
    initialData,
  });
}

export function useDeletedBrands(
  params: { page: number; pageSize: number; q: string },
  initialData?: PagedResult<BrandListItemDto>
) {
  return useQuery({
    queryKey: ["brands", "trash", params] as const,
    queryFn: () => listDeletedBrands(params),
    initialData,
  });
}
