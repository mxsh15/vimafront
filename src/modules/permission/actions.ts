"use server";

import { revalidatePath } from "next/cache";
import { createPermission, updatePermission, deletePermission } from "@/modules/permission/api";
import type { PermissionUpsertInput } from "@/modules/permission/schemas";
import { serverFetch } from "@/lib/server/http";

export async function upsertPermissionFormAction(formData: FormData) {
  const id = (formData.get("id") as string) || undefined;

  const payload: PermissionUpsertInput = {
    name: String(formData.get("name") || "").trim(),
    displayName: (formData.get("displayName") as string) || null,
    description: (formData.get("description") as string) || null,
    category: (formData.get("category") as string) || null,
    status: formData.get("status") === "true" || formData.get("status") === "on",
  };

  if (!payload.name) {
    throw new Error("نام دسترسی الزامی است.");
  }

  if (id) {
    await updatePermission(id, payload);
  } else {
    await createPermission(payload);
  }

  revalidatePath("/admin/permissions");
}

export async function upsertPermissionAction(
  id: string | undefined,
  payload: PermissionUpsertInput
) {
  if (id) await updatePermission(id, payload);
  else await createPermission(payload);
  revalidatePath("/admin/permissions");
}

export async function deletePermissionAction(id: string) {
  await deletePermission(id);
  revalidatePath("/admin/permissions");
}

export async function restorePermissionAction(id: string) {
  await serverFetch<void>(`permissions/${id}/restore`, { method: "POST" });
  revalidatePath("/admin/permissions");
  revalidatePath("/admin/permissions/trash");
}

export async function hardDeletePermissionAction(id: string) {
  await serverFetch<void>(`permissions/${id}/hard`, { method: "DELETE" });
  revalidatePath("/admin/permissions/trash");
}

