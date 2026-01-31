"use server";

import { AuthResponseDto, LoginDto, RegisterDto } from "./types";
import { apiFetch } from "@/lib/api";

export async function login(data: LoginDto): Promise<AuthResponseDto> {
  return apiFetch<AuthResponseDto>("auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function register(data: RegisterDto): Promise<AuthResponseDto> {
  return apiFetch<AuthResponseDto>("auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
