import { apiFetch } from "@/lib/api";

export type PublicProductCardDto = {
  id: string;
  title: string;
  primaryImageUrl?: string | null;
  minPrice?: number | null;
};

export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export async function listPublicProducts({
  page = 1,
  pageSize = 8,
  q,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
} = {}): Promise<PagedResult<PublicProductCardDto>> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q?.trim()) params.set("q", q.trim());

  return apiFetch<PagedResult<PublicProductCardDto>>(
    `store/products?${params.toString()}`,
    { method: "GET" }
  );
}
