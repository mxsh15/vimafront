import { ENV } from "@/lib/env";
import { apiRequest } from "@/lib/http/request";

export async function serverFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  if (!ENV.BACKEND_URL) {
    throw new Error(
      'Missing BACKEND_URL. Set it in ".env.local" (e.g. BACKEND_URL=http://localhost:5167/api).'
    );
  }

  const clean = path.replace(/^\/+/, "");
  const base = ENV.BACKEND_URL.replace(/\/+$/, "");
  const url = `${base}/${clean}`;

  let token: string | undefined;
  try {
    const headersMod = await import("next/headers");
    const cookieStore = await headersMod.cookies();
    token = cookieStore.get("auth_token")?.value;
  } catch (e) {
    token = undefined;
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init?.headers || {}),
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const { data } = await apiRequest<T>(url, {
    ...init,
    headers,
    cache: init?.cache ?? "no-store",
  });

  return data;
}

// Expose as global for modules that still reference `serverFetch` (compat shim)
try {
  (globalThis as any).serverFetch = serverFetch;
} catch (e) {
  // ignore
}
