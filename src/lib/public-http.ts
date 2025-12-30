import "server-only";
import { ENV } from "@/lib/env";
import { apiRequest } from "@/lib/http/request";

export async function publicFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const baseUrl = ENV.BACKEND_URL;
  const url = path.startsWith("http") ? path : `${baseUrl}/${path}`;

  const { data } = await apiRequest<T>(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: init?.cache ?? "no-store",
  });

  return data;
}
