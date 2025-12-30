import { isServer } from "@/lib/is-server";
import { clientFetch } from "@/lib/fetch-client";

/**
 * Universal fetch for app-router.
 * - On the server: call BACKEND_URL directly (fast, avoids extra hop)
 * - On the client: call Next BFF (/api/...) to keep cookies + same-origin
 */
export const apiFetch = async <T>(path: string, init?: RequestInit) => {
  if (isServer) {
    const { serverFetch } = await import("@/lib/server/http");
    return serverFetch<T>(path, init);
  }

  return clientFetch<T>(path, init);
};
