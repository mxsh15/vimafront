import { apiFetch } from "@/lib/api";
import type {
    AdminHomeBannerListItem,
    AdminHomeBannerUpsert,
    PagedResult,
    PublicHomeBanner,
} from "./types";

export function getPublicHomeBanners(): Promise<PublicHomeBanner[]> {
    return apiFetch<PublicHomeBanner[]>(`public/home-banners`);
}

export function adminListHomeBanners(params: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: "all" | "active" | "inactive";
}): Promise<PagedResult<AdminHomeBannerListItem>> {
    const sp = new URLSearchParams();
    sp.set("page", String(params.page ?? 1));
    sp.set("pageSize", String(params.pageSize ?? 20));
    if (params.q && params.q.trim()) sp.set("q", params.q.trim());
    sp.set("status", params.status ?? "all");

    return apiFetch<PagedResult<AdminHomeBannerListItem>>(
        `admin/home-banners?${sp.toString()}`
    );
}

export function adminCreateHomeBanner(dto: AdminHomeBannerUpsert) {
    return apiFetch<AdminHomeBannerListItem>(`admin/home-banners`, {
        method: "POST",
        body: JSON.stringify(dto),
    });
}

export function adminUpdateHomeBanner(id: string, dto: AdminHomeBannerUpsert) {
    return apiFetch<void>(`admin/home-banners/${id}`, {
        method: "PUT",
        body: JSON.stringify(dto),
    });
}

export function adminDeleteHomeBanner(id: string) {
    return apiFetch<void>(`admin/home-banners/${id}`, {
        method: "DELETE",
    });
}
