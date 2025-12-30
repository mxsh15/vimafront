export type ShippingAddressDto = {
  id: string;
  userId: string;
  title: string;
  province: string;
  city: string;
  addressLine: string;
  postalCode?: string | null;
  isDefault?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  createdAtUtc: string;
};

export type ShippingAddressCreateDto = {
  title: string;
  province: string;
  city: string;
  addressLine: string;
  postalCode?: string | null;
  isDefault: boolean;
  latitude?: number | null;
  longitude?: number | null;
};
