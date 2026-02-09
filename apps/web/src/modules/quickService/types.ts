export type PagedResult<T> = {
    page: number;
    pageSize: number;
    total: number;
    items: T[];
};

export type PublicQuickService = {
    mediaAssetId: string;
    mediaUrl: string;
    title: string;
    linkUrl: string | null;
};

export type AdminQuickServiceListItem = {
    id: string;
    mediaAssetId: string;
    mediaUrl: string;
    title: string;
    linkUrl: string | null;
    sortOrder: number;
    isActive: boolean;
};

export type AdminQuickServiceUpsert = {
    mediaAssetId: string;
    title: string;
    linkUrl: string | null;
    sortOrder: number;
    isActive: boolean;
};
