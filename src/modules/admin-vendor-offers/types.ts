export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type VendorOfferStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Disabled";

export type AdminVendorOfferListItemDto = {
  id: string;
  productId: string;
  productTitle: string;
  vendorId: string;
  vendorName: string;
  price: number;
  discountPrice?: number | null;
  isDefaultForProduct: boolean;
  status: VendorOfferStatus;
  isDeleted: boolean;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  deletedAtUtc?: string | null;
  rowVersion: string;
};

export type AdminOfferModerationDto = { notes?: string | null };

export type AdminPriceDiscrepancyOfferDto = {
  offerId: string;
  vendorId: string;
  vendorName: string;
  price: number;
  discountPrice?: number | null;
  status: VendorOfferStatus;
};

export type AdminPriceDiscrepancyRowDto = {
  productId: string;
  productTitle: string;
  offersCount: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  spreadAmount: number;
  spreadPercent: number;
  offers: AdminPriceDiscrepancyOfferDto[];
};

export type VendorOfferModerationAction =
  | "Approve"
  | "Reject"
  | "Disable"
  | "Enable"
  | "SoftDelete"
  | "Restore"
  | "HardDelete";

export type AdminVendorOfferModerationLogDto = {
  id: string;
  vendorOfferId: string;
  adminUserId: string;
  adminEmail?: string | null;
  adminFullName?: string | null;
  action: VendorOfferModerationAction;
  notes?: string | null;
  createdAtUtc: string;
};

export type AdminVendorOfferDetailDto = {
  id: string;
  productId: string;
  productTitle: string;
  vendorId: string;
  vendorName: string;
  price: number;
  discountPrice?: number | null;
  isDefaultForProduct: boolean;
  status: VendorOfferStatus;
  manageStock: boolean;
  stockQuantity: number;
  isDeleted: boolean;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  deletedAtUtc?: string | null;
  rowVersion: string;
};
