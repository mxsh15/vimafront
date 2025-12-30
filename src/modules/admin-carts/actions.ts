"use server";

import { revalidatePath } from "next/cache";
import { deleteAdminCart, restoreAdminCart, hardDeleteAdminCart } from "./api";

export async function deleteAdminCartAction(id: string) {
  await deleteAdminCart(id);
  revalidatePath("/admin/carts");
  revalidatePath("/admin/carts/trash");
}

export async function restoreAdminCartAction(id: string) {
  await restoreAdminCart(id);
  revalidatePath("/admin/carts");
  revalidatePath("/admin/carts/trash");
}

export async function hardDeleteAdminCartAction(id: string) {
  await hardDeleteAdminCart(id);
  revalidatePath("/admin/carts/trash");
}
