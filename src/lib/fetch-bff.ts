"use client";

import { getToken } from "@/modules/auth/client-api";

export async function bffFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const withoutSlash = path.replace(/^\/+/, "");
  const clean = path.startsWith("/api/") ? path : `/api/${withoutSlash}`;

  // برای کلاینت همون مسیر نسبی /api/... کفایت می‌کنه
  const url = clean;

  const token = getToken();
  const headers: HeadersInit = {
    ...(init?.headers || {}),
  };

  if (!(headers as any)["Content-Type"] && init?.body) {
    (headers as any)["Content-Type"] = "application/json";
  }

  if (token && !(headers as any).Authorization) {
    (headers as any).Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`BFF ${res.status} ${res.statusText}: ${txt}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text().catch(() => "");

  if (!text) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return JSON.parse(text) as T;
  }

  return text as unknown as T;
}
