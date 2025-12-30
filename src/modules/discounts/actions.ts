"use server";

import { revalidatePath } from "next/cache";
import { createDiscount, updateDiscount, deleteDiscount, restoreDiscount, hardDeleteDiscount } from "./api";
import type { DiscountUpsertDto } from "./types";

export async function upsertDiscountAction(
  id: string | null,
  dto: DiscountUpsertDto
) {
  if (id) await updateDiscount(id, dto);
  else await createDiscount(dto);

  revalidatePath("/admin/discounts");
}

export async function deleteDiscountAction(id: string) {
  await deleteDiscount(id);
  revalidatePath("/admin/discounts");
}

// Trash:
export async function restoreDiscountAction(id: string) {
  await restoreDiscount(id);
  revalidatePath("/admin/discounts");
  revalidatePath("/admin/discounts/trash");
}

export async function hardDeleteDiscountAction(id: string) {
  await hardDeleteDiscount(id);
  revalidatePath("/admin/discounts/trash");
}
