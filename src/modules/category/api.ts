import { apiFetch } from "@/lib/api";
import { PagedResult } from "../brand/types";
import {
  CategoryListItemDto,
  CategoryDetailDto,
  CategoryOptionDto,
} from "./types";

export async function listCategories({
  page = 1,
  pageSize = 20,
  q,
  parentId,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
  parentId?: string;
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (q && q.trim()) params.set("q", q.trim());
  if (parentId) params.set("parentId", parentId);

  const url = `productCategories?${params.toString()}`;
  return apiFetch<PagedResult<CategoryListItemDto>>(url);
}

export async function listDeletedCategories({
  page = 1,
  pageSize = 20,
  q,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q && q.trim()) params.set("q", q.trim());

  return apiFetch<PagedResult<CategoryListItemDto>>(
    `productCategories/trash?${params.toString()}`
  );
}

export async function listCategoryOptions({
  onlyActive = true,
}: { onlyActive?: boolean } = {}) {
  const params = new URLSearchParams();
  if (onlyActive) params.set("onlyActive", "true");

  const qs = params.toString();
  const url = qs ? `productCategories/options?${qs}` : `productCategories/options`;

  return apiFetch<CategoryOptionDto[]>(url);
}

export async function getCategory(id: string) {
  return apiFetch<CategoryDetailDto>(`productCategories/${id}`);
}
