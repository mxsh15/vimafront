export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminShippingAddressListItemDto = {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  addressLine: string;
  postalCode?: string | null;
  isDefault: boolean;
  usedInOrders: boolean;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  isDeleted: boolean;
  deletedAtUtc?: string | null;
  rowVersion: string;
};

export type AdminShippingAddressDetailDto = AdminShippingAddressListItemDto & {
  userPhone?: string | null;
  notes?: string | null;
};
