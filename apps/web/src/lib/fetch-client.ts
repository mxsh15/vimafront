import { apiRequest } from "@/lib/http/request";

const isServer = typeof window === "undefined";

export async function clientFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (isServer) {
    console.warn("⚠️ clientFetch is being used on the server. Consider using serverFetch instead.");
  }

  const clean = path.replace(/^\/+/, "");

  const headers: HeadersInit = { ...(init?.headers || {}) };

  if (!(headers as any)["Content-Type"] && init?.body) {
    (headers as any)["Content-Type"] = "application/json";
  }

  const { data } = await apiRequest<T>(`/api/${clean}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  return data;
}
