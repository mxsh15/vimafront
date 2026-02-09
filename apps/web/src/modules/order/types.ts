export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type OrderRow = {
  id: string;
  orderNumber: string;
  userFullName: string;
  status: number;
  totalAmount: number;
  itemsCount: number;
  createdAtUtc: string;
};

export type OrderStatusUpdateDto = {
  status: OrderStatus;
};

export type OrderCreateItemDto = {
  productId: string;
  vendorOfferId: string;
  productVariantId?: string | null;
  quantity: number;
};

export type OrderCreateDto = {
  shippingAddressId: string;
  couponId?: string | null;
  notes?: string | null;
  items: OrderCreateItemDto[];
};

export type OrderDto = {
  id: string;
  status: string | number;
  totalAmount: number;
  payableAmount: number;
  createdAtUtc: string;
};
