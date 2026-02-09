export async function clientGetBlogPost(id: string) {
  const res = await fetch(`/api/blog-posts/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load blog post");
  const data = await res.json();

  return {
    ...data,
    categoryIds: Array.isArray(data.categories)
      ? data.categories.map((c: any) => String(c.id))
      : [],
    tagIds: Array.isArray(data.tags)
      ? data.tags.map((t: any) => String(t.id))
      : [],
  };
}


export async function resolveMediaIdByUrl(url: string): Promise<string | null> {
  const res = await fetch(`/api/media/resolve?url=${encodeURIComponent(url)}`, { cache: "no-store" });
  if (!res.ok) return null;
  const id = await res.json();
  return String(id);
}
