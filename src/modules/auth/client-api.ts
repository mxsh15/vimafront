"use client";

import { clientFetch } from "@/lib/fetch-client";
import { bffFetch } from "@/lib/fetch-bff";
import { UserDto } from "./types";

export type MyPermissionsDto = string[];

export async function getMyPermissions(): Promise<MyPermissionsDto> {
  return await bffFetch<MyPermissionsDto>("/api/auth/permissions", {
    method: "GET",
  });
}

export async function getCurrentUser(): Promise<UserDto> {
  return await bffFetch<UserDto>("/api/auth/me", {
    method: "GET",
  });
}

// Token Management - فقط برای client-side
export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
    // همچنین در cookie هم ذخیره می‌کنیم برای server-side access
    document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
}

export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    // حذف cookie
    document.cookie = "auth_token=; path=/; max-age=0";
  }
}
