// import { ENV } from "@/lib/env";

// export function resolveMediaUrl(url?: string | null): string {
//   if (!url) return "";

//   if (/^https?:\/\//i.test(url)) {
//     return url;
//   }

//   if (ENV.BACKEND_URL) {
//     const origin = new URL(ENV.BACKEND_URL).origin.replace(/\/+$/, "");
//     const path = url.startsWith("/") ? url : `/${url}`;
//     return origin + path;
//   }

//   const site =
//     ENV.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "http://localhost:3000";
//   const path = url.startsWith("/") ? url : `/${url}`;
//   return site + path;
// }

import { ENV } from "@/lib/env";

export function resolveMediaUrl(url: unknown): string {
  if (!url) return "";

  // URL object
  if (url instanceof URL) return url.toString();

  // فقط string
  if (typeof url !== "string") return "";

  const u = url.trim();
  if (!u) return "";

  // absolute / special schemes
  if (
    u.startsWith("http://") ||
    u.startsWith("https://") ||
    u.startsWith("data:") ||
    u.startsWith("blob:") ||
    u.startsWith("//")
  ) {
    return u;
  }

  // backend origin
  if (ENV.BACKEND_URL) {
    const origin = new URL(ENV.BACKEND_URL).origin.replace(/\/+$/, "");
    const path = u.startsWith("/") ? u : `/${u}`;
    return origin + path;
  }

  // fallback to site url (اگر واقعاً لازم داری)
  const site =
    ENV.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "http://localhost:3000";
  const path = u.startsWith("/") ? u : `/${u}`;
  return site + path;
}
