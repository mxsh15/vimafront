"use client";

import { useQuery } from "@tanstack/react-query";
import { listVendors, listDeletedVendors } from "./api";
import type { PagedResult, VendorRow, VendorListItemDto } from "./types";

function normalizeVendorPaged(res: PagedResult<VendorListItemDto>): PagedResult<VendorRow> {
  return {
    page: (res as any).page ?? 1,
    pageSize: (res as any).pageSize ?? 20,
    totalCount: (res as any).totalCount ?? 0,
    items: (res.items ?? []).map((v: any) => ({
      id: v.id,
      storeName: v.storeName,
      legalName: v.legalName ?? null,
      nationalId: v.nationalId ?? null,
      phoneNumber: v.phoneNumber ?? null,
      mobileNumber: v.mobileNumber ?? null,
      defaultCommissionPercent: v.defaultCommissionPercent ?? null,
      ownerUserId: v.ownerUserId ?? null,
      ownerUserName: v.ownerUserName ?? null,
      productsCount: v.productsCount ?? 0,
      ordersCount: v.ordersCount ?? 0,
      totalSales: v.totalSales ?? null,
      status: !!v.status,
      createdAtUtc: v.createdAtUtc,
    })),
  };
}

export function useVendors(
  params: { page: number; pageSize: number; q: string; status?: string },
  initialData?: PagedResult<VendorRow>
) {
  return useQuery({
    queryKey: ["vendors", params] as const,
    queryFn: async () => normalizeVendorPaged((await listVendors(params)) as any),
    initialData,
  });
}

export function useDeletedVendors(
  params: { page: number; pageSize: number; q: string },
  initialData?: PagedResult<VendorRow>
) {
  return useQuery({
    queryKey: ["vendors", "trash", params] as const,
    queryFn: async () => normalizeVendorPaged((await listDeletedVendors(params)) as any),
    initialData,
  });
}
