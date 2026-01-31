import { apiFetch } from "@/lib/api";
import { PagedResult } from "@/shared/types/adminlistpageTypes";

export async function getBrands(params: {
  page?: number;
  pageSize?: number;
  q?: string;
  trash?: boolean;
}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params.q) qs.set("q", params.q);
  if (params.trash) qs.set("trash", "true");

  return apiFetch<PagedResult<any>>(`brands?${qs.toString()}`, {
    method: "GET",
  });
}

export async function getBrand(id: string) {
  return apiFetch<any>(`brands/${id}`, { method: "GET" });
}
