import "server-only";
import { serverFetch } from "@/lib/server/http";

export type MyPermissionsDto = string[];

export async function getMyPermissionsServer(): Promise<MyPermissionsDto> {
  return await serverFetch<MyPermissionsDto>("auth/permissions", {
    method: "GET",
  });
}
