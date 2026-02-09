"use client";

import { useQuery } from "@tanstack/react-query";
import { listDeletedUsers, listUsers } from "./api";
import type { PagedResult } from "@/modules/brand/types";
import type { UserRow } from "./types";

export type UsersListParams = {
  page: number;
  pageSize: number;
  q?: string;
  role?: string;
  status?: string;
};

export function useUsers(
  params: UsersListParams,
  initialData?: PagedResult<UserRow>
) {
  return useQuery({
    queryKey: ["admin-users", params] as const,
    queryFn: () => listUsers(params),
    initialData,
  });
}

export function useDeletedUsers(
  params: Omit<UsersListParams, "role" | "status">,
  initialData?: PagedResult<UserRow>
) {
  return useQuery({
    queryKey: ["admin-users", "trash", params] as const,
    queryFn: () => listDeletedUsers(params),
    initialData,
  });
}
