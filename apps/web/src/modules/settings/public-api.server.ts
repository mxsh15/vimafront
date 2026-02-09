import { apiFetch } from "@/lib/api";
import { cacheTag, unstable_cache } from "next/cache";
import { PublicStoreSettingsDto } from "./types";
import { cacheProfiles } from "@/lib/cache/profiles";
import { publicFetch } from "@/lib/public-http";

export const getPublicSettingsCached = unstable_cache(
  async () => {
    return apiFetch<any>("public/settings", {
      next: { revalidate: 3600, tags: ["public-settings"] },
    });
  },
  ["public-settings-v1"],
  { revalidate: 3600 }
);


export async function getPublicStoreSettings(): Promise<PublicStoreSettingsDto> {
  "use cache";
  cacheTag("public-settings");
  cacheProfiles.storeStaticDays();

  return publicFetch<PublicStoreSettingsDto>("public/settings", {
    method: "GET",
    cache: "force-cache",
  });
}