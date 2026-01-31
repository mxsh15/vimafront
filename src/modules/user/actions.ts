"use server";

import { revalidateTag } from "next/cache";
import type { UserUpsertInput } from "@/modules/user/schemas";
import {
  createUser,
  updateUser,
  deleteUser,
  restoreUser,
  hardDeleteUser,
} from "@/modules/user/api";

const TAGS = {
  list: "users",
  trash: "users:trash",
  detail: (id: string) => `user:${id}`,
};

function normalizeEmail(v: unknown) {
  return String(v ?? "")
    .trim()
    .toLowerCase();
}

function normalizePhone(v: unknown) {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

export async function upsertUserFormAction(formData: FormData) {
  const id = (formData.get("id") as string | null)?.trim() || undefined;

  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (!id && !password) throw new Error("رمز عبور الزامی است.");

  if (password) {
    if (!passwordConfirm) throw new Error("لطفاً تکرار رمز عبور را وارد کنید.");
    if (password !== passwordConfirm)
      throw new Error("رمز عبور و تکرار آن یکسان نیستند.");
  }

  const vendorIds = formData
    .getAll("vendorIds")
    .map((x) => String(x).trim())
    .filter(Boolean);

  const payload: UserUpsertInput = {
    email: normalizeEmail(formData.get("email")),
    password: password || undefined,
    firstName: String(formData.get("firstName") ?? "").trim(),
    lastName: String(formData.get("lastName") ?? "").trim(),
    phoneNumber: normalizePhone(formData.get("phoneNumber")),
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
    revalidateTag(TAGS.detail(id), "max");
  } else {
    if (!payload.password) throw new Error("رمز عبور الزامی است.");
    await createUser(payload);
  }

  revalidateTag(TAGS.list, "max");
  revalidateTag(TAGS.trash, "max");
}

export async function upsertUserAction(
  id: string | undefined,
  payload: UserUpsertInput
) {
  if (id) {
    await updateUser(id, payload);
    revalidateTag(TAGS.detail(id), "max");
  } else {
    await createUser(payload);
  }
  revalidateTag(TAGS.list, "max");
  revalidateTag(TAGS.trash, "max");
}

export async function deleteUserAction(id: string) {
  await deleteUser(id);
  revalidateTag(TAGS.list, "max");
  revalidateTag(TAGS.trash, "max");
  revalidateTag(TAGS.detail(id), "max");
}

export async function restoreUserAction(id: string) {
  await restoreUser(id);
  revalidateTag(TAGS.list, "max");
  revalidateTag(TAGS.trash, "max");
  revalidateTag(TAGS.detail(id), "max");
}

export async function hardDeleteUserAction(id: string) {
  await hardDeleteUser(id);
  revalidateTag(TAGS.trash, "max");
  revalidateTag(TAGS.detail(id), "max");
}
