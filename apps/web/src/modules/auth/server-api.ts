import "server-only";
import { serverFetch } from "@/lib/server/http";

export type MyPermissionsDto = string[];

export async function getMyPermissionsServer() {
  return serverFetch("auth/permissions", { method: "GET" });
}
