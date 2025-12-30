"use client";

import { apiFetch } from "@/lib/api";
import type { UserDto } from "./types";

export async function getUserClient(id: string): Promise<UserDto> {
  return apiFetch<UserDto>(`users/${id}`, { method: "GET" });
}
