"use server";

import { revalidatePath } from "next/cache";
import {
  deleteAdminShippingAddress,
  restoreAdminShippingAddress,
  hardDeleteAdminShippingAddress,
} from "./api";

export async function deleteAdminShippingAddressAction(id: string) {
  await deleteAdminShippingAddress(id);
  revalidatePath("/admin/shipping-addresses");
  revalidatePath("/admin/shipping-addresses/trash");
  revalidatePath("/admin/shipping-addresses/abandoned");
}

export async function restoreAdminShippingAddressAction(id: string) {
  await restoreAdminShippingAddress(id);
  revalidatePath("/admin/shipping-addresses");
  revalidatePath("/admin/shipping-addresses/trash");
  revalidatePath("/admin/shipping-addresses/abandoned");
}

export async function hardDeleteAdminShippingAddressAction(id: string) {
  await hardDeleteAdminShippingAddress(id);
  revalidatePath("/admin/shipping-addresses/trash");
}
