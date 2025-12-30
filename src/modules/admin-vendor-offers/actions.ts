"use server";

import { revalidatePath } from "next/cache";
import {
  approveOffer,
  rejectOffer,
  disableOffer,
  enableOffer,
  deleteOffer,
  restoreOffer,
  hardDeleteOffer,
} from "./api";

function revalidateAll() {
  revalidatePath("/admin/vendor-offers");
  revalidatePath("/admin/vendor-offers/trash");
  revalidatePath("/admin/vendor-offers/price-discrepancies");
}

export async function approveOfferAction(
  id: string,
  rowVersion: string,
  notes?: string
) {
  await approveOffer(id, { notes });
  revalidateAll();
}
export async function rejectOfferAction(id: string, notes?: string) {
  await rejectOffer(id, { notes });
  revalidateAll();
}
export async function disableOfferAction(id: string, notes?: string) {
  await disableOffer(id, { notes });
  revalidateAll();
}
export async function enableOfferAction(id: string, notes?: string) {
  await enableOffer(id, { notes });
  revalidateAll();
}

export async function deleteOfferAction(id: string) {
  await deleteOffer(id);
  revalidateAll();
}
export async function restoreOfferAction(id: string) {
  await restoreOffer(id);
  revalidateAll();
}
export async function hardDeleteOfferAction(id: string) {
  await hardDeleteOffer(id);
  revalidatePath("/admin/vendor-offers/trash");
}
