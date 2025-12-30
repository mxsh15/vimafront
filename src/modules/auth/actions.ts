"use server";

import { revalidatePath } from "next/cache";
import { login as loginApi, register as registerApi } from "./api";
import { loginSchema, registerSchema } from "./schemas";

export async function loginAction(formData: FormData) {
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validation = loginSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await loginApi(validation.data);
    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "خطا در ورود",
    };
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
    role: (formData.get("role") as "Customer" | "Vendor" | "Admin") || "Customer",
  };

  const validation = registerSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await registerApi(validation.data);
    revalidatePath("/");
    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "خطا در ثبت‌نام",
    };
  }
}

