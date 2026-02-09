import type { CouponDto } from "./types";

export async function clientGetCoupon(id: string): Promise<CouponDto> {
  const res = await fetch(`/api/coupons/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch coupon");
  return res.json();
}
