export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminWishlistListItemDto = {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  name?: string | null;
  isDefault: boolean;
  itemsCount: number;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  isDeleted: boolean;
  deletedAtUtc?: string | null;
  rowVersion: string;
};

export type AdminWishlistItemDto = {
  id: string;
  productId: string;
  productTitle: string;
  vendorOfferId?: string | null;
  vendorName?: string | null;
  createdAtUtc: string;
};

export type AdminWishlistDetailDto = {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  name?: string | null;
  isDefault: boolean;
  items: AdminWishlistItemDto[];
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  isDeleted: boolean;
  deletedAtUtc?: string | null;
  rowVersion: string;
};

export type AdminWishlistTopProductDto = {
  productId: string;
  productTitle: string;
  wishCount: number;
};
