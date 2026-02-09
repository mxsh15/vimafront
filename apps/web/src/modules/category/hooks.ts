"use client";

import { useQuery } from "@tanstack/react-query";
import { listCategories, listDeletedCategories } from "./api";
import type { PagedResult } from "../brand/types";
import type { CategoryListItemDto } from "./types";

export function useCategories(
  params: { page: number; pageSize: number; q: string; parentId?: string },
  initialData?: PagedResult<CategoryListItemDto>
) {
  return useQuery({
    queryKey: ["categories", params] as const,
    queryFn: () => listCategories(params),
    initialData,
  });
}

export function useDeletedCategories(
  params: { page: number; pageSize: number; q: string },
  initialData?: PagedResult<CategoryListItemDto>
) {
  return useQuery({
    queryKey: ["categories", "trash", params] as const,
    queryFn: () => listDeletedCategories(params),
    initialData,
  });
}
