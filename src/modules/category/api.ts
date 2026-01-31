import { apiFetch } from "@/lib/api";
import { PagedResult } from "../admin-audit-logs/types";
import { CategoryListItemDto, CategoryOptionDto } from "./types";

export async function listCategories(params: {
  page: number;
  pageSize: number;
  q?: string;
  parentId?: string;
}): Promise<PagedResult<CategoryListItemDto>> {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("pageSize", String(params.pageSize));

  if (params.q?.trim()) sp.set("q", params.q.trim());
  if (params.parentId?.trim()) sp.set("parentId", params.parentId.trim());

  return apiFetch<PagedResult<CategoryListItemDto>>(
    `productCategories?${sp.toString()}`,
    {
      next: { tags: ["categories"] },
    }
  );
}

export async function listCategoryOptions(params?: {
  onlyActive?: boolean;
}): Promise<CategoryOptionDto[]> {
  const sp = new URLSearchParams();
  if (params?.onlyActive) sp.set("onlyActive", "true");

  return apiFetch<CategoryOptionDto[]>(
    `productCategories/options?${sp.toString()}`,
    {
      next: { tags: ["categories:options"] },
    }
  );
}

export async function listDeletedCategories(params: {
  page: number;
  pageSize: number;
  q?: string;
}): Promise<PagedResult<CategoryListItemDto>> {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("pageSize", String(params.pageSize));
  if (params.q?.trim()) sp.set("q", params.q.trim());

  return apiFetch<PagedResult<CategoryListItemDto>>(
    `productCategories/deleted?${sp.toString()}`,
    {
      next: { tags: ["categories:trash"] },
    }
  );
}

export async function createCategory(input: any) {
  return apiFetch<void>("productCategories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCategory(id: string, input: any) {
  return apiFetch<void>(`productCategories/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteCategory(id: string) {
  return apiFetch<void>(`productCategories/${id}`, { method: "DELETE" });
}

export async function restoreCategory(id: string) {
  return apiFetch<void>(`productCategories/${id}/restore`, { method: "POST" });
}

export async function hardDeleteCategory(id: string) {
  return apiFetch<void>(`productCategories/${id}/hard`, { method: "DELETE" });
}

export async function listPublicCategoryOptions(params?: { onlyActive?: boolean }) {
  const onlyActive = params?.onlyActive ?? true;
  return apiFetch<CategoryOptionDto[]>(
    `/public/productCategories/options?onlyActive=${onlyActive ? "true" : "false"}`
  );
}
