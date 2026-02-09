"use server";

import { apiFetch } from "@/lib/api";
import type {
    AdminHomeBannerListItem,
    AdminHomeBannerUpsert,
    PagedResult,
} from "./types";

export async function listHomeBannersAction(args: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: "all" | "active" | "inactive";
}): Promise<PagedResult<AdminHomeBannerListItem>> {
    const sp = new URLSearchParams();
    sp.set("page", String(args.page ?? 1));
    sp.set("pageSize", String(args.pageSize ?? 20));
    if (args.q && args.q.trim()) sp.set("q", args.q.trim());
    sp.set("status", args.status ?? "all");

    return apiFetch<PagedResult<AdminHomeBannerListItem>>(
        `admin/home-banners?${sp.toString()}`
    );
}

export async function createHomeBannerAction(dto: AdminHomeBannerUpsert) {
    return apiFetch<AdminHomeBannerListItem>(`admin/home-banners`, {
        method: "POST",
        body: JSON.stringify(dto),
    });
}

export async function updateHomeBannerAction(id: string, dto: AdminHomeBannerUpsert) {
    return apiFetch<void>(`admin/home-banners/${id}`, {
        method: "PUT",
        body: JSON.stringify(dto),
    });
}

export async function deleteHomeBannerAction(id: string) {
    return apiFetch<void>(`admin/home-banners/${id}`, {
        method: "DELETE",
    });
}
