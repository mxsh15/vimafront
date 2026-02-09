import { apiFetch } from "@/lib/api";
import type {
  PagedResult,
  AdminAuditLogListItemDto,
  AdminAuditLogDetailDto,
} from "./types";

export async function listAdminAuditLogs({
  page = 1,
  pageSize = 20,
  q,
  status,
  method,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: number;
  method?: string;
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q?.trim()) params.set("q", q.trim());
  if (status) params.set("status", String(status));
  if (method?.trim()) params.set("method", method.trim().toUpperCase());
  return serverFetch<PagedResult<AdminAuditLogListItemDto>>(
    `admin/audit-logs?${params.toString()}`
  );
}

export async function getAdminAuditLog(id: string) {
  return serverFetch<AdminAuditLogDetailDto>(`admin/audit-logs/${id}`);
}
