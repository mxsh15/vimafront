import { ENV } from "@/lib/env";

export function resolveMediaUrl(url?: string | null): string {
  if (!url) return "";

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (ENV.BACKEND_URL) {
    const origin = new URL(ENV.BACKEND_URL).origin.replace(/\/+$/, "");
    const path = url.startsWith("/") ? url : `/${url}`;
    return origin + path;
  }

  const site =
    ENV.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "http://localhost:3000";
  const path = url.startsWith("/") ? url : `/${url}`;
  return site + path;
}
