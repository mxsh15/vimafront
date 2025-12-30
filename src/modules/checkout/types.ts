export type ShippingOptionDto = {
  shippingRateId: string;
  shippingMethodId: string;
  shippingMethodTitle: string;
  price: number;
  etaDaysMin?: number | null;
  etaDaysMax?: number | null;
};
