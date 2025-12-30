export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type ReturnStatus = "Pending" | "Approved" | "Rejected" | "Completed";
export type RefundStatus = "Pending" | "Processing" | "Completed" | "Failed";

export type AdminReturnListItemDto = {
  id: string;
  orderId: string;
  orderItemId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  reason: string;
  status: ReturnStatus;
  requestedAt: string;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  isDeleted: boolean;
  deletedAtUtc?: string | null;
  rowVersion: string;
};

export type AdminRefundDto = {
  id: string;
  paymentId: string;
  amount: number;
  status: RefundStatus;
  transactionId?: string | null;
  failureReason?: string | null;
  createdAt: string;
  processedAt?: string | null;
};

export type AdminReturnDetailDto = {
  id: string;
  orderId: string;
  orderItemId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  reason: string;
  description?: string | null;
  status: ReturnStatus;
  adminNotes?: string | null;
  reviewedBy?: string | null;
  requestedAt: string;
  approvedAt?: string | null;
  completedAt?: string | null;
  refund?: AdminRefundDto | null;

  createdAtUtc: string;
  updatedAtUtc?: string | null;
  isDeleted: boolean;
  deletedAtUtc?: string | null;
  rowVersion: string;
};

export type AdminReturnReviewDto = {
  approve: boolean;
  adminNotes?: string | null;
};

export type AdminCreateRefundDto = {
  paymentId: string;
  amount: number;
};
