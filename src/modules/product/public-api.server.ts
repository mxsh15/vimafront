import { publicFetch } from "../../lib/public-http";
import { cacheLife, cacheTag } from "next/cache";
import { PagedResult, PublicProductCardDto, PublicProductCoreDto, PublicProductDto, PublicProductOffersDto } from "./types";

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

  return publicFetch<PagedResult<PublicProductCardDto>>(
    `store/products?${params.toString()}`,
    { method: "GET" }
  );
}

export async function listPublicProductsCached({
  page = 1,
  pageSize = 20,
  q,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
} = {}): Promise<PagedResult<PublicProductCardDto>> {
  "use cache";
  cacheTag("catalog:shop");
  cacheLife("minutes");

  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q?.trim()) params.set("q", q.trim());

  return publicFetch<PagedResult<PublicProductCardDto>>(
    `store/products?${params.toString()}`,
    {
      method: "GET",
      cache: "force-cache",
    }
  );
}

export async function getPublicProduct(id: string): Promise<PublicProductDto> {
  return publicFetch<PublicProductDto>(`store/${id}`, {
    method: "GET",
  });
}

export async function getPublicProductCore(
  id: string
): Promise<PublicProductCoreDto> {
  "use cache";
  cacheTag(`product-core:${id}`);
  cacheLife("days");

  const p = await publicFetch<PublicProductDto>(`store/${id}`, {
    method: "GET",
    cache: "force-cache",
  });

  return {
    id: p.id,
    title: p.title,
    descriptionHtml: p.descriptionHtml ?? null,
    primaryImageUrl: p.primaryImageUrl ?? null,
  };
}

export async function getPublicProductOffers(
  id: string
): Promise<PublicProductOffersDto> {
  const p = await publicFetch<PublicProductDto>(`store/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  return {
    id: p.id,
    vendorOffers: p.vendorOffers ?? [],
  };
}
