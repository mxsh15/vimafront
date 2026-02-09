export type ShippingStatus = "Pending" | "Shipped" | "Delivered" | "Cancelled";

export type ShipmentRow = {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  province: string;
  city: string;

  status: ShippingStatus;
  trackingNumber?: string | null;
  shippingCompany?: string | null;
  shippingMethod?: string | null;

  shippedAt?: string | null;
  deliveredAt?: string | null;
  estimatedDeliveryDate?: string | null;

  createdAtUtc: string;
};

export type ShippingUpsertDto = {
  status: ShippingStatus;
  trackingNumber?: string | null;
  shippingCompany?: string | null;
  shippingMethod?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  estimatedDeliveryDate?: string | null;
};
