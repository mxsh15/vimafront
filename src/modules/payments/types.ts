export type PaymentStatus = "Pending" | "Completed" | "Failed" | "Cancelled";
export type PaymentMethod = string;

export type PaymentRow = {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  customerName: string;

  transactionId: string;
  referenceNumber?: string | null;
  method: PaymentMethod;
  status: number;
  amount: number;
  gatewayName?: string | null;
  paidAt?: string | null;
  createdAtUtc: string;
};
