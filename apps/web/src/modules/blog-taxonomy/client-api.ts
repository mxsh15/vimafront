import { bffFetch } from "@/lib/fetch-bff";
import type { BlogTagListDto } from "./types";
import { normalizeSlug } from "@/lib/slug";

export async function createBlogTagClient(name: string) {
  const payload = {
    name: name.trim(),
    slug: normalizeSlug(name),
  };

  return bffFetch<BlogTagListDto>("blog-tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
