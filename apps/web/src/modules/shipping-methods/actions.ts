"use server";

import { revalidatePath } from "next/cache";
import {
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
  restoreShippingMethod,
  hardDeleteShippingMethod,
} from "./api";
import type { ShippingMethodUpsertDto } from "./types";

function toNumberOrNull(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function createShippingMethodAction(formData: FormData) {
  const dto: ShippingMethodUpsertDto = {
    title: String(formData.get("title") ?? "").trim(),
    code: String(formData.get("code") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    status: String(formData.get("status") ?? "true") === "true",
    sortOrder: Number(String(formData.get("sortOrder") ?? "0")),
    defaultPrice: toNumberOrNull(formData.get("defaultPrice")),
  };

  await createShippingMethod(dto);
  revalidatePath("/admin/shipping-methods");
}

export async function updateShippingMethodAction(
  id: string,
  formData: FormData
) {
  const dto: ShippingMethodUpsertDto = {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    status: String(formData.get("status") ?? "true") === "true",
    sortOrder: Number(String(formData.get("sortOrder") ?? "0")),
    defaultPrice: toNumberOrNull(formData.get("defaultPrice")),
  };

  await updateShippingMethod(id, dto);
  revalidatePath("/admin/shipping-methods");
}

export async function deleteShippingMethodAction(id: string) {
  await deleteShippingMethod(id);
  revalidatePath("/admin/shipping-methods");
}

export async function restoreShippingMethodAction(id: string) {
  await restoreShippingMethod(id);
  revalidatePath("/admin/shipping-methods/trash");
  revalidatePath("/admin/shipping-methods");
}

export async function hardDeleteShippingMethodAction(id: string) {
  await hardDeleteShippingMethod(id);
  revalidatePath("/admin/shipping-methods/trash");
}
