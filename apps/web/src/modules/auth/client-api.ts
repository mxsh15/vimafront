"use client";

import { bffFetch } from "@/lib/fetch-bff";
import { UserDto } from "./types";

export type MyPermissionsDto = string[];

export async function getMyPermissions(): Promise<MyPermissionsDto> {
  return await bffFetch<MyPermissionsDto>("/api/auth/permissions", { method: "GET" });
}

export async function getCurrentUser(): Promise<UserDto> {
  return await bffFetch<UserDto>("/api/auth/me", { method: "GET" });
}
