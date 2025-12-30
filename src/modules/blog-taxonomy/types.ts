export type SeoUpsert = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string | null;
  canonicalUrl?: string | null;
  seoMetaRobots?: string | null;
  seoSchemaJson?: string | null;
  autoGenerateSnippet: boolean;
  autoGenerateHeadTags: boolean;
  includeInSitemap: boolean;
};

export type BlogCategoryListDto = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  parentName?: string | null;
  createdAtUtc: string;
};

export type BlogCategoryUpsertDto = {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string | null;
  canonicalUrl?: string | null;
  seoMetaRobots?: string | null;
  seoSchemaJson?: string | null;
  autoGenerateSnippet: boolean;
  autoGenerateHeadTags: boolean;
  includeInSitemap: boolean;
};

export type BlogCategoryOptionDto = {
  id: string;
  name: string;
};

export type BlogTagListDto = {
  id: string;
  name: string;
  slug: string;
  createdAtUtc: string;
};

export type BlogTagUpsertDto = {
  id?: string;
  name: string;
  slug: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string | null;
  canonicalUrl?: string | null;
  seoMetaRobots?: string | null;
  seoSchemaJson?: string | null;
  autoGenerateSnippet: boolean;
  autoGenerateHeadTags: boolean;
  includeInSitemap: boolean;
};

export type BlogTagOptionDto = {
  id: string;
  name: string;
};

export type BlogCategoryRowWithLevel = BlogCategoryListDto & {
  level: number;
};

export type BlogCategoryGetDto = BlogCategoryListDto & SeoUpsert;
export type BlogTagGetDto = BlogTagListDto & SeoUpsert;