export enum BlogPostStatus {
  Draft = 0,
  Published = 1,
  Unlisted = 2,
  Archived = 3,
}

export type BlogCategoryOptionDto = {
  id: string;
  name: string;
  parentId?: string | null;
};

export type BlogTagOptionDto = {
  id: string;
  name: string;
};

export type BlogPostListItemDto = {
  id: string;
  thumbnailMediaId: string | null;
  thumbnailImageUrl: string | null;
  title: string;
  slug: string;

  authorId: string | null;
  authorName: string | null;

  categories: string[];

  status: number;

  publishedAtUtc: string | null;
  updatedAtUtc: string | null;
  createdAtUtc: string;
};

export type BlogPostDto = {
  id: string;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  rowVersion?: string | null;

  title: string;
  slug: string;
  contentHtml?: string | null;

  thumbnailMediaId?: string | null;
  thumbnailImageUrl?: string | null;

  categoryIds: string[];
  tagIds: string[];

  authorId?: string | null;
  schemaPresetId?: string | null;
  seoMetaRobots?: string | null;

  status: BlogPostStatus;
  visibility: number;

  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  canonicalUrl?: string | null;
  openGraphTitle?: string | null;
  openGraphDescription?: string | null;
  openGraphImageUrl?: string | null;
  seoSchemaJson?: string | null;
  autoGenerateHeadTags?: boolean;
  includeInSitemap?: boolean;
};

export type BlogPostUpsertInput = Omit<
  BlogPostDto,
  "createdAtUtc" | "updatedAtUtc" | "thumbnailImageUrl"
>;

export type AuthorOptionDto = { id: string; fullName: string };