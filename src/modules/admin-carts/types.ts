export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminCartListItemDto = {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  totalItems: number;
  totalPrice: number;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  isDeleted: boolean;
  deletedAtUtc?: string | null;
  rowVersion: string;
};

export type AdminCartDetailDto = {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  userPhone?: string | null;
  items: {
    id: string;
    productId: string;
    productTitle: string;
    productImageUrl?: string | null;
    vendorOfferId?: string | null;
    productVariantId?: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  totalPrice: number;
  totalItems: number;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  isDeleted: boolean;
  deletedAtUtc?: string | null;
  rowVersion: string;
};
