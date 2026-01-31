import { serverFetch } from "@/lib/server/http";

type CachedInit = RequestInit & {
  tags: string[];
  revalidate?: number;
};

export async function serverFetchCached<T>(
  path: string,
  init: CachedInit
): Promise<T> {
  const { tags, revalidate, ...rest } = init;
  return serverFetch<T>(path, {
    ...rest,
    method: rest.method ?? "GET",
    cache: rest.cache ?? "force-cache",
    next: { tags, revalidate },
  });
}
