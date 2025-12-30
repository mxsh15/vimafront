import { apiFetch } from "@/lib/api";
import type { StoreSettingsDto } from "./types";

export async function getSettings() {
  return apiFetch<StoreSettingsDto>("settings");
}

export async function updateSettings(
  payload: Partial<StoreSettingsDto> & { rowVersion: string }
) {
  return apiFetch<StoreSettingsDto>("settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
