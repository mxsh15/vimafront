import { publicFetch } from "../../lib/public-http";
import { cacheTag } from "next/cache";
import {
  PagedResult,
  PublicProductCardDto,
  PublicProductCoreDto,
  PublicProductDto,
  PublicProductOffersDto,
} from "./types";
import { cacheProfiles } from "@/lib/cache/profiles";
import { normalizeSlugParam } from "./slug";

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
  cacheProfiles.catalogHours();

  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q?.trim()) params.set("q", q.trim());

  return publicFetch<PagedResult<PublicProductCardDto>>(
    `store/products?${params.toString()}`,
    { method: "GET", cache: "force-cache" }
  );
}

export async function getPublicProductCore(slug: string): Promise<PublicProductCoreDto> {
  "use cache";
  const s = normalizeSlugParam(slug);
  cacheTag(`product-core:${s}`);
  cacheProfiles.storeStaticDays();

  const p = await publicFetch<PublicProductDto>(`store/by-slug/${encodeURIComponent(s)}`, {
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

export async function getPublicProductOffersBySlug(
  slug: string
): Promise<PublicProductOffersDto> {
  const s = normalizeSlugParam(slug);
  const p = await publicFetch<PublicProductDto>(`store/by-slug/${encodeURIComponent(s)}`, {
    method: "GET",
    cache: "no-store",
  });

  return {
    id: p.id,
    vendorOffers: p.vendorOffers ?? [],
  };
}

// (اختیاری) اگر جایی هنوز id می‌فرستی، نگهش دار
export async function getPublicProductOffers(id: string): Promise<PublicProductOffersDto> {
  const p = await publicFetch<PublicProductDto>(`store/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  return {
    id: p.id,
    vendorOffers: p.vendorOffers ?? [],
  };
}


export async function getPublicProductDetail(slug: string): Promise<PublicProductDto> {
  "use cache";
  const s = normalizeSlugParam(slug);
  cacheTag(`product-detail:${s}`);
  cacheProfiles.storeStaticDays();

  return publicFetch<PublicProductDto>(`store/by-slug/${encodeURIComponent(s)}`, {
    method: "GET",
    cache: "force-cache",
  });
}