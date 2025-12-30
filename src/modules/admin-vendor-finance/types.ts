export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type TransactionType =
  | "Earning"
  | "Withdrawal"
  | "Commission"
  | "Refund"
  | "Adjustment";
export type PayoutStatus = "Pending" | "Processing" | "Completed" | "Rejected";

export type AdminVendorWalletListItemDto = {
  vendorId: string;
  storeName: string;
  balance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
};

export type AdminVendorTransactionListItemDto = {
  id: string;
  vendorId: string;
  storeName: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  orderId?: string | null;
  description?: string | null;
  referenceNumber?: string | null;
  createdAtUtc: string;
};

export type AdminVendorPayoutListItemDto = {
  id: string;
  vendorId: string;
  storeName: string;
  amount: number;
  status: PayoutStatus;
  bankName?: string | null;
  accountNumber?: string | null;
  shabaNumber?: string | null;
  requestedAt: string;
  processedAt?: string | null;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  isDeleted: boolean;
  deletedAtUtc?: string | null;
  rowVersion: string;
};

export type AdminVendorPayoutDetailDto = AdminVendorPayoutListItemDto & {
  bankAccountInfo?: string | null;
  adminNotes?: string | null;
  processedBy?: string | null;
};

export type AdminWalletAdjustmentDto = {
  amount: number;
  description?: string | null;
  referenceNumber?: string | null;
};

export type AdminPayoutDecisionDto = {
  approve: boolean;
  adminNotes?: string | null;
};
export type AdminMarkPayoutCompletedDto = {
  referenceNumber?: string | null;
  adminNotes?: string | null;
};
