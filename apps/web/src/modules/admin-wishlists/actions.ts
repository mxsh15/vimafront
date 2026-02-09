"use server";

import { revalidatePath } from "next/cache";
import {
  deleteAdminWishlist,
  restoreAdminWishlist,
  hardDeleteAdminWishlist,
} from "./api";

function revalidateAll() {
  revalidatePath("/admin/wishlists");
  revalidatePath("/admin/wishlists/trash");
}

export async function deleteAdminWishlistAction(id: string) {
  await deleteAdminWishlist(id);
  revalidateAll();
}

export async function restoreAdminWishlistAction(id: string) {
  await restoreAdminWishlist(id);
  revalidateAll();
}

export async function hardDeleteAdminWishlistAction(id: string) {
  await hardDeleteAdminWishlist(id);
  revalidatePath("/admin/wishlists/trash");
}
