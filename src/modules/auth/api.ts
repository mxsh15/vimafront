"use server";

import { AuthResponseDto, LoginDto, RegisterDto } from "./types";
import { apiFetch } from "@/lib/api";

/**
 * این فایل فقط برای server-side استفاده می‌شود (server actions)
 * برای client-side از client-api.ts استفاده کنید
 */

export async function login(data: LoginDto): Promise<AuthResponseDto> {
  return serverFetch<AuthResponseDto>("auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function register(data: RegisterDto): Promise<AuthResponseDto> {
  return serverFetch<AuthResponseDto>("auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

