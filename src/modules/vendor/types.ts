export type VendorDto = {
  id: string;
  storeName: string;
  legalName?: string | null;
  nationalId?: string | null;
  phoneNumber?: string | null;
  mobileNumber?: string | null;
  defaultCommissionPercent?: number | null;
  ownerUserId?: string | null;
  ownerUserName?: string | null;
  createdAtUtc: string;
  status: boolean;
};

export type VendorListItemDto = {
  id: string;
  storeName: string;
  legalName?: string | null;
  nationalId?: string | null;
  phoneNumber?: string | null;
  mobileNumber?: string | null;
  defaultCommissionPercent?: number | null;
  ownerUserId?: string | null;
  status: boolean;
  createdAtUtc: string;
  productsCount?: number;
  ordersCount?: number;
};

export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type VendorRow = {
  id: string;
  storeName: string;
  legalName?: string | null;
  nationalId?: string | null;
  phoneNumber?: string | null;
  mobileNumber?: string | null;
  defaultCommissionPercent?: number | null;
  ownerUserId?: string | null;
  ownerUserName?: string | null;
  productsCount: number;
  ordersCount: number;
  totalSales?: number | null;
  status: boolean;
  createdAtUtc: string;
};

export type VendorOptionDto = {
  id: string;
  title: string;
};

export type VendorMemberDto = {
  vendorId: string;
  userId: string;
  userEmail: string;
  fullName: string;
  role: string;
  isActive: boolean;
};
