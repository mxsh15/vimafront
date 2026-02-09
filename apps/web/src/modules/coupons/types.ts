export type CouponType = 0 | 1;

export type CouponListItemDto = {
  deletedAt: any;
  id: string;
  code: string;
  title: string;
  type: CouponType;
  value: number;
  usedCount: number;
  maxUsageCount?: number | null;
  isActive: boolean;
  validTo?: string | null;
  createdAtUtc: string;
};

export type CouponDto = {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  type: CouponType;
  value: number;
  minPurchaseAmount?: number | null;
  maxDiscountAmount?: number | null;
  maxUsageCount?: number | null;
  usedCount: number;
  maxUsagePerUser?: number | null;
  validFrom?: string | null;
  validTo?: string | null;
  isActive: boolean;
  createdAtUtc: string;
};

export type CouponUpsertDto = {
  code: string;
  title: string;
  description?: string | null;
  type: CouponType;
  value: number;
  minPurchaseAmount?: number | null;
  maxDiscountAmount?: number | null;
  maxUsageCount?: number | null;
  maxUsagePerUser?: number | null;
  validFrom?: string | null;
  validTo?: string | null;
};
