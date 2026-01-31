import { apiFetch } from "@/lib/api";
import { unstable_cache } from "next/cache";

export const getPublicSettingsCached = unstable_cache(
  async () => {
    return apiFetch<any>("public/settings", {
      next: { revalidate: 3600, tags: ["public-settings"] },
    });
  },
  ["public-settings-v1"],
  { revalidate: 3600 }
);
