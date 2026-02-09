"use client";

import { useQuery } from "@tanstack/react-query";
import { PagedResult } from "../admin-audit-logs/types";
import { BlogPostListItemDto } from "./types";
import { listBlogPosts, listDeletedBlogPosts } from "./api";

export function useProducts(
  params: { page: number; pageSize: number; q: string },
  initialData?: PagedResult<BlogPostListItemDto>
) {
  return useQuery({
    queryKey: ["blog-posts", params] as const,
    queryFn: () => listBlogPosts(params),
    initialData,
  });
}

export function useDeletedProducts(
  params: { page: number; pageSize: number; q: string },
  initialData?: PagedResult<BlogPostListItemDto>
) {
  return useQuery({
    queryKey: ["blog-posts", "trash", params] as const,
    queryFn: () => listDeletedBlogPosts(params),
    initialData,
  });
}
