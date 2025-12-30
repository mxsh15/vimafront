"use server";

import { revalidatePath } from "next/cache";
import {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  restoreCoupon,
  hardDeleteCoupon,
} from "./api";
import type { CouponUpsertDto } from "./types";

export async function upsertCouponAction(
  id: string | null,
  dto: CouponUpsertDto
) {
  if (id) await updateCoupon(id, dto);
  else await createCoupon(dto);
  revalidatePath("/admin/coupons");
}

export async function deleteCouponAction(id: string) {
  await deleteCoupon(id);
  revalidatePath("/admin/coupons");
}

// Trash:
export async function restoreCouponAction(id: string) {
  await restoreCoupon(id);
  revalidatePath("/admin/coupons");
  revalidatePath("/admin/coupons/trash");
}

export async function hardDeleteCouponAction(id: string) {
  await hardDeleteCoupon(id);
  revalidatePath("/admin/coupons/trash");
}
