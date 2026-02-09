"use server";

import { apiFetch } from "@/lib/api";
import type {
    AdminQuickServiceListItem,
    AdminQuickServiceUpsert,
    PagedResult,
} from "./types";

export async function listQuickServicesAction(args: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: "all" | "active" | "inactive";
}): Promise<PagedResult<AdminQuickServiceListItem>> {
    const sp = new URLSearchParams();
    sp.set("page", String(args.page ?? 1));
    sp.set("pageSize", String(args.pageSize ?? 20));
    if (args.q && args.q.trim()) sp.set("q", args.q.trim());
    sp.set("status", args.status ?? "all");

    return apiFetch<PagedResult<AdminQuickServiceListItem>>(
        `admin/quick-services?${sp.toString()}`
    );
}

export async function createQuickServiceAction(dto: AdminQuickServiceUpsert) {
    return apiFetch<AdminQuickServiceListItem>(`admin/quick-services`, {
        method: "POST",
        body: JSON.stringify(dto),
    });
}

export async function updateQuickServiceAction(id: string, dto: AdminQuickServiceUpsert) {
    return apiFetch<void>(`admin/quick-services/${id}`, {
        method: "PUT",
        body: JSON.stringify(dto),
    });
}

export async function deleteQuickServiceAction(id: string) {
    return apiFetch<void>(`admin/quick-services/${id}`, {
        method: "DELETE",
    });
}
