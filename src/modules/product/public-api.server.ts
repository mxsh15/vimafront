import { publicFetch } from "../../lib/public-http";

export type PublicProductCardDto = {
  id: string;
  title: string;
  primaryImageUrl?: string | null;
  minPrice?: number | null;
};

export type PublicVendorOfferDto = {
  id: string;
  vendorId: string;
  vendorName: string;
  price: number;
  discountPrice?: number | null;
  manageStock: boolean;
  stockQuantity: number;
  status: number | string;
  isDeleted: boolean;
};

export type PublicProductDto = {
  id: string;
  title: string;
  descriptionHtml?: string | null;
  primaryImageUrl?: string | null;
  vendorOffers?: PublicVendorOfferDto[];
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

  return publicFetch<PagedResult<PublicProductCardDto>>(
    `store/products?${params.toString()}`,
    { method: "GET" }
  );
}

export async function getPublicProduct(id: string): Promise<PublicProductDto> {
  return publicFetch<PublicProductDto>(`store/${id}`, {
    method: "GET",
  });
}
