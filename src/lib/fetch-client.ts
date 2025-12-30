import { ENV } from "@/lib/env";
import { apiRequest } from "@/lib/http/request";

const isServer = typeof window === "undefined";

/**
 * این تابع مخصوص Client Component هاست.
 * درخواست را به Next.js Route Handler (/api/...) می‌فرستد.
 */
export async function clientFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  if (isServer) {
    console.warn(
      "⚠️ clientFetch is being used on the server. Consider using serverFetch instead."
    );
  }

  const clean = path.replace(/^\/+/, "");

  const headers: HeadersInit = {
    ...(init?.headers || {}),
  };

  // content-type فقط وقتی body داریم ست شود
  if (!(headers as any)["Content-Type"] && init?.body) {
    (headers as any)["Content-Type"] = "application/json";
  }

  // اگر توکن موجود است و Authorization ست نشده، اضافه کن
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("auth_token");
    if (token && !(headers as any).Authorization) {
      (headers as any).Authorization = `Bearer ${token}`;
    }
  }

  const { data } = await apiRequest<T>(`/api/${clean}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  return data;
}

/**
 * برای ساختن URL کامل جهت استفاده در BFF یا جاهایی که نیاز به URL مطلق داریم
 */
export function absoluteBff(path: string) {
  const clean = path.replace(/^\/+/, "");
  const siteUrl = ENV.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${siteUrl.replace(/\/+$/, "")}/api/${clean}`;
}
