import { apiFetch } from "@/lib/api";
import type { PublicStoreSettingsDto } from "./public-types";

export async function getPublicSettings() {
  return apiFetch<PublicStoreSettingsDto>("public/settings");
}
