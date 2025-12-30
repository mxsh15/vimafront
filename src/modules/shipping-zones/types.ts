export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type ShippingZoneListItemDto = {
  id: string;
  title: string;
  status: boolean;
  sortOrder: number;
  countryCode: string | null;
  province: string | null;
  city: string | null;
  createdAtUtc: string;
};

export type ShippingZoneUpsertDto = {
  title: string;
  description?: string | null;
  status: boolean;
  sortOrder: number;
  countryCode?: string | null;
  province?: string | null;
  city?: string | null;
  postalCodePattern?: string | null;
};

export type ShippingZoneRateDto = {
  shippingMethodId: string;
  price: number;
  minOrderAmount: number | null;
  freeShippingMinOrderAmount: number | null;
  etaDaysMin: number | null;
  etaDaysMax: number | null;
};
