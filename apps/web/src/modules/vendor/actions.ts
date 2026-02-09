"use server";

import { revalidatePath } from "next/cache";
import { createVendor, updateVendor, deleteVendor } from "@/modules/vendor/api";
import type { VendorUpsertInput } from "@/modules/vendor/schemas";
import { serverFetch } from "@/lib/server/http";

export async function upsertVendorFormAction(formData: FormData) {
  const id = (formData.get("id") as string) || undefined;
  const isEdit = Boolean(id);

  const ownerUserIdRaw = formData.get("ownerUserId") as string | null;

  const payload: VendorUpsertInput = {
    storeName: String(formData.get("storeName") || "").trim(),
    legalName: (formData.get("legalName") as string) || null,
    nationalId: (formData.get("nationalId") as string) || null,
    phoneNumber: (formData.get("phoneNumber") as string) || null,
    mobileNumber: (formData.get("mobileNumber") as string) || null,
    defaultCommissionPercent: formData.get("defaultCommissionPercent")
      ? parseFloat(String(formData.get("defaultCommissionPercent")))
      : null,
    ownerUserId: !isEdit && ownerUserIdRaw ? ownerUserIdRaw : null,
    status:
      formData.get("status") === "true" ||
      formData.get("status") === "on" ||
      (!isEdit ? true : false),
  };

  if (!payload.storeName) {
    throw new Error("نام فروشنده الزامی است");
  }

  if (isEdit) {
    await updateVendor(id!, payload);
  } else {
    await createVendor(payload);
  }

  revalidatePath("/admin/vendors");
}

export async function upsertVendorAction(
  id: string | undefined,
  payload: VendorUpsertInput
) {
  if (id) await updateVendor(id, payload);
  else await createVendor(payload);
  revalidatePath("/admin/vendors");
}

export async function deleteVendorAction(id: string) {
  await deleteVendor(id);
  revalidatePath("/admin/vendors");
}

export async function restoreVendorAction(id: string) {
  await serverFetch<void>(`vendors/${id}/restore`, { method: "POST" });
  revalidatePath("/admin/vendors");
  revalidatePath("/admin/vendors/trash");
}

export async function hardDeleteVendorAction(id: string) {
  await serverFetch<void>(`vendors/${id}/hard`, { method: "DELETE" });
  revalidatePath("/admin/vendors/trash");
}
