"use server";

import { revalidatePath } from "next/cache";
import { createUser, updateUser, deleteUser } from "@/modules/user/api";
import type { UserUpsertInput } from "@/modules/user/schemas";
import { apiFetch } from "@/lib/api";

export async function upsertUserFormAction(formData: FormData) {
  const id = (formData.get("id") as string) || undefined;

  const password = (formData.get("password") as string) || "";
  const passwordConfirm = (formData.get("passwordConfirm") as string) || "";

  if (!id && !password) {
    throw new Error("رمز عبور الزامی است.");
  }

  if (password) {
    if (!passwordConfirm) {
      throw new Error("لطفاً تکرار رمز عبور را وارد کنید.");
    }
    if (password !== passwordConfirm) {
      throw new Error("رمز عبور و تکرار آن یکسان نیستند.");
    }
  }

  const vendorIds = formData
    .getAll("vendorIds")
    .map((x) => String(x))
    .filter((x) => x && x !== "");

  const payload: UserUpsertInput = {
    email: String(formData.get("email") || "")
      .trim()
      .toLowerCase(),
    password: password || undefined,
    firstName: String(formData.get("firstName") || "").trim(),
    lastName: String(formData.get("lastName") || "").trim(),
    phoneNumber: (formData.get("phoneNumber") as string) || null,
    role: Number(formData.get("role") ?? "0"),
    roleId: (formData.get("roleId") as string) || null,
    vendorIds,
    status:
      formData.get("status") === "true" || formData.get("status") === "on",
  };

  if (!payload.email || !payload.firstName || !payload.lastName) {
    throw new Error("ایمیل، نام و نام خانوادگی الزامی هستند.");
  }

  if (id) {
    await updateUser(id, payload);
  } else {
    if (!payload.password) {
      throw new Error("رمز عبور الزامی است.");
    }
    await createUser(payload);
  }

  revalidatePath("/admin/users");
}

export async function upsertUserAction(
  id: string | undefined,
  payload: UserUpsertInput
) {
  if (id) await updateUser(id, payload);
  else await createUser(payload);
  revalidatePath("/admin/users");
}

export async function deleteUserAction(id: string) {
  await deleteUser(id);
  revalidatePath("/admin/users");
}

export async function restoreUserAction(id: string) {
  await serverFetch<void>(`users/${id}/restore`, { method: "POST" });
  revalidatePath("/admin/users");
  revalidatePath("/admin/users/trash");
}

export async function hardDeleteUserAction(id: string) {
  await serverFetch<void>(`users/${id}/hard`, { method: "DELETE" });
  revalidatePath("/admin/users/trash");
}
