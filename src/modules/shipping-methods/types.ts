export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type ShippingMethodListItemDto = {
  id: string;
  title: string;
  code: string;
  status: boolean;
  sortOrder: number;
  defaultPrice: number | null;
  createdAtUtc: string;
};

export type ShippingMethodUpsertDto = {
  title: string;
  description?: string | null;
  status: boolean;
  sortOrder: number;
  defaultPrice?: number | null;
};