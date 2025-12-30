"use server";

import { revalidatePath } from "next/cache";
import {
  softDeleteAdminReturn,
  restoreAdminReturn,
  hardDeleteAdminReturn,
  reviewAdminReturn,
  completeAdminReturn,
  createRefundForReturn,
} from "./api";
import type { AdminCreateRefundDto, AdminReturnReviewDto } from "./types";

function revalidateAll() {
  revalidatePath("/admin/returns");
  revalidatePath("/admin/returns/abandoned");
  revalidatePath("/admin/returns/trash");
}

export async function deleteAdminReturnAction(id: string) {
  await softDeleteAdminReturn(id);
  revalidateAll();
}

export async function restoreAdminReturnAction(id: string) {
  await restoreAdminReturn(id);
  revalidateAll();
}

export async function hardDeleteAdminReturnAction(id: string) {
  await hardDeleteAdminReturn(id);
  revalidatePath("/admin/returns/trash");
}

export async function reviewAdminReturnAction(
  id: string,
  dto: AdminReturnReviewDto
) {
  await reviewAdminReturn(id, dto);
  revalidateAll();
  revalidatePath(`/admin/returns/${id}`);
}

export async function completeAdminReturnAction(
  id: string,
  adminNotes?: string
) {
  await completeAdminReturn(id, adminNotes);
  revalidateAll();
  revalidatePath(`/admin/returns/${id}`);
}

export async function createRefundForReturnAction(
  id: string,
  dto: AdminCreateRefundDto
) {
  await createRefundForReturn(id, dto);
  revalidateAll();
  revalidatePath(`/admin/returns/${id}`);
}
