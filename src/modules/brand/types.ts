export type SeoMetadataDto = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string | null;
  canonicalUrl?: string | null;
  autoGenerateSnippet?: boolean;
  autoGenerateHeadTags?: boolean;
  includeInSitemap?: boolean;
};

export type BrandListItemDto = {
  id: string;
  title: string;
  slug: string;
  logoUrl?: string | null;
};

export type BrandDto = {
  id: string;
  title: string;
  englishTitle?: string | null;
  slug: string;
  websiteUrl?: string | null;
  contentHtml?: string | null;
  logoUrl?: string | null;
  seo: SeoMetadataDto;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  isDeleted: boolean;
  rowVersion: string;
};

export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type BrandRow = {
  id: string;
  title: string;
  slug: string;
  englishTitle?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  contentHtml?: string | null;
  isActive: boolean;
  createdAtUtc: string;
};

export type BrandOptionDto = {
  id: string;
  title: string;
};


// Backward-compat alias (older UI imports expect `Brand`)
export type Brand = BrandDto;
