"use client";

import { bffFetch } from "@/lib/fetch-bff";
import type { RoleDetailDto } from "./types";

/**
 * این فایل فقط برای client-side استفاده می‌شود
 * برای server-side از api.ts استفاده کنید
 */

// گرفتن یک نقش
export async function getRole(id: string): Promise<RoleDetailDto> {
  return bffFetch<RoleDetailDto>(`/api/roles/${id}`, {
    method: "GET",
  });
}

