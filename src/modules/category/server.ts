import { apiFetch } from "@/lib/api";
import type { CategoryOptionDto } from "./types";

export async function getPublicCategoryOptionsCached(onlyActive = true) {
    return apiFetch<CategoryOptionDto[]>(
        `public/productCategories/options?onlyActive=${onlyActive ? "true" : "false"}`,
        {
            cache: "force-cache",
            next: { revalidate: 3600, tags: ["categories:options"] },
        }
    );
}
