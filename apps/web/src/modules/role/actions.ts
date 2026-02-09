"use server";

import { revalidatePath } from "next/cache";
import { createRole, updateRole, deleteRole } from "@/modules/role/api";
import type { RoleUpsertInput } from "@/modules/role/schemas";
import { apiFetch } from "@/lib/api";

export async function upsertRoleFormAction(formData: FormData) {
  const id = (formData.get("id") as string) || undefined;

  const permissionIdsStr = formData.get("permissionIds") as string;
  const permissionIds = permissionIdsStr
    ? permissionIdsStr.split(",").filter((id) => id.trim())
    : [];

  const payload: RoleUpsertInput = {
    name: String(formData.get("name") || "").trim(),
    description: (formData.get("description") as string) || null,
    permissionIds: permissionIds,
    status: formData.get("status") === "true" || formData.get("status") === "on",
  };

  if (!payload.name) {
    throw new Error("نام نقش الزامی است.");
  }

  if (id) {
    await updateRole(id, payload);
  } else {
    await createRole(payload);
  }

  revalidatePath("/admin/roles");
}

export async function upsertRoleAction(
  id: string | undefined,
  payload: RoleUpsertInput
) {
  if (id) await updateRole(id, payload);
  else await createRole(payload);
  revalidatePath("/admin/roles");
}

export async function deleteRoleAction(id: string) {
  await deleteRole(id);
  revalidatePath("/admin/roles");
}

export async function restoreRoleAction(id: string) {
  await serverFetch<void>(`roles/${id}/restore`, { method: "POST" });
  revalidatePath("/admin/roles");
  revalidatePath("/admin/roles/trash");
}

export async function hardDeleteRoleAction(id: string) {
  await serverFetch<void>(`roles/${id}/hard`, { method: "DELETE" });
  revalidatePath("/admin/roles/trash");
}

