import { apiFetch } from "@/lib/api";
import type {
    AdminQuickServiceListItem,
    AdminQuickServiceUpsert,
    PagedResult,
    PublicQuickService,
} from "./types";

export function getPublicQuickServices(): Promise<PublicQuickService[]> {
    return apiFetch<PublicQuickService[]>(`public/quick-services`);
}

export function adminListQuickServices(params: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: "all" | "active" | "inactive";
}): Promise<PagedResult<AdminQuickServiceListItem>> {
    const sp = new URLSearchParams();
    sp.set("page", String(params.page ?? 1));
    sp.set("pageSize", String(params.pageSize ?? 20));
    if (params.q && params.q.trim()) sp.set("q", params.q.trim());
    sp.set("status", params.status ?? "all");

    return apiFetch<PagedResult<AdminQuickServiceListItem>>(
        `admin/quick-services?${sp.toString()}`
    );
}

export function adminCreateQuickService(dto: AdminQuickServiceUpsert) {
    return apiFetch<AdminQuickServiceListItem>(`admin/quick-services`, {
        method: "POST",
        body: JSON.stringify(dto),
    });
}

export function adminUpdateQuickService(id: string, dto: AdminQuickServiceUpsert) {
    return apiFetch<void>(`admin/quick-services/${id}`, {
        method: "PUT",
        body: JSON.stringify(dto),
    });
}

export function adminDeleteQuickService(id: string) {
    return apiFetch<void>(`admin/quick-services/${id}`, {
        method: "DELETE",
    });
}
