export type PublicHomeBanner = {
    mediaAssetId: string;
    mediaUrl: string;
    linkUrl?: string | null;
    title?: string | null;
    altText?: string | null;
};

export type AdminHomeBannerListItem = {
  id: string;
  mediaAssetId: string;
  mediaUrl: string;
  linkUrl?: string | null;
  title?: string | null;
  altText?: string | null;
  sortOrder: number;
  isActive: boolean;
  startAt?: string | null;
  endAt?: string | null;
  createdAtUtc: string;
};

export type AdminHomeBannerUpsert = {
    mediaAssetId: string;
    linkUrl?: string | null;
    title?: string | null;
    altText?: string | null;
    sortOrder: number;
    isActive: boolean;
    startAt?: string | null;
    endAt?: string | null;
};

export type PagedResult<T> = {
    page: number;
    pageSize: number;
    total: number;
    items: T[];
};
