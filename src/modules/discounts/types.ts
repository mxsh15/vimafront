export type DiscountType = 0 | 1;

export type DiscountListItemDto = {
  deletedAt: any;
  code: string;
  id: string;
  title: string;
  type: DiscountType;
  value: number;
  isActive: boolean;
  productId?: string | null;
  categoryId?: string | null;
  vendorId?: string | null;
  brandId?: string | null;
  createdAtUtc: string;
};

export type DiscountDto = {
  id: string;
  title: string;
  description?: string | null;
  type: DiscountType;
  value: number;

  productId?: string | null;
  categoryId?: string | null;
  vendorId?: string | null;
  brandId?: string | null;

  minPurchaseAmount?: number | null;
  maxDiscountAmount?: number | null;

  validFrom?: string | null;
  validTo?: string | null;

  isActive: boolean;
  createdAtUtc: string;
};

export type DiscountUpsertDto = {
  title: string;
  description?: string | null;
  type: DiscountType;
  value: number;

  productId?: string | null;
  categoryId?: string | null;
  vendorId?: string | null;
  brandId?: string | null;

  minPurchaseAmount?: number | null;
  maxDiscountAmount?: number | null;

  validFrom?: string | null;
  validTo?: string | null;

  isActive: boolean;
};
