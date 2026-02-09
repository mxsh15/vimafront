"use server";

import { revalidatePath } from "next/cache";
import { login as loginApi, register as registerApi } from "./api";
import { loginSchema, registerSchema } from "./schemas";

const SESSION_COOKIE = "auth_token";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

async function setSessionCookie(token: string) {
  const headersMod = await import("next/headers");
  const cookieStore = await headersMod.cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

async function clearSessionCookie() {
  const headersMod = await import("next/headers");
  const cookieStore = await headersMod.cookies();

  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function loginAction(formData: FormData) {
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validation = loginSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, errors: validation.error.flatten().fieldErrors };
  }

  try {
    const result = await loginApi(validation.data);
    await setSessionCookie(result.token);
    return { success: true, data: { user: result.user } };
  } catch (error: any) {
    return { success: false, error: error.message || "خطا در ورود" };
  }
}

export async function registerAction(formData: FormData) {
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    phoneNumber: (formData.get("phoneNumber") as string) || undefined,
  };

  const validation = registerSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, errors: validation.error.flatten().fieldErrors };
  }

  try {
    const result = await registerApi(validation.data);
    await setSessionCookie(result.token);
    revalidatePath("/");
    return { success: true, data: { user: result.user } };
  } catch (error: any) {
    return { success: false, error: error.message || "خطا در ثبت‌نام" };
  }
}

export async function logoutAction() {
  await clearSessionCookie();
  revalidatePath("/");
  return { success: true };
}
