import createClient from "openapi-fetch";
import type { paths } from "./schema";

export const openapiBff = createClient<paths>({
  baseUrl: "",
  headers: {
    Accept: "application/json",
  },
});

export function openapiServer(baseUrl: string, authToken?: string) {
  return createClient<paths>({
    baseUrl: baseUrl.replace(/\/api\/?$/, ""),
    headers: {
      Accept: "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
  });
}
