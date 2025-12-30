export interface CartDto {
  id: string;
  userId: string;
  items: CartItemDto[];
  totalPrice: number;
  totalItems: number;
  createdAtUtc: string;
}

export interface CartItemDto {
  id: string;
  productId: string;
  productTitle: string;
  productImageUrl?: string;
  vendorOfferId?: string;
  productVariantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface AddToCartDto {
  productId: string;
  vendorOfferId: string;
  productVariantId?: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

