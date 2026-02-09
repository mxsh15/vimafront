import { apiFetch } from "@/lib/api";
import type {
  PagedResult,
  AdminNotificationListItemDto,
  AdminSendNotificationDto,
  NotificationType,
} from "./types";

export async function listAdminNotifications({
  page = 1,
  pageSize = 20,
  q,
  type,
  isRead,
  userId,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
  type?: NotificationType;
  isRead?: boolean;
  userId?: string;
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q?.trim()) params.set("q", q.trim());
  if (typeof type === "number") params.set("type", String(type));
  if (typeof isRead === "boolean") params.set("isRead", String(isRead));
  if (userId?.trim()) params.set("userId", userId.trim());

  return serverFetch<PagedResult<AdminNotificationListItemDto>>(
    `admin/notifications?${params.toString()}`
  );
}

export async function sendAdminNotification(dto: AdminSendNotificationDto) {
  return serverFetch<{ created: number }>(`admin/notifications/send`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function markNotificationRead(id: string) {
  return serverFetch<void>(`admin/notifications/${id}/mark-read`, {
    method: "POST",
  });
}

export async function markNotificationUnread(id: string) {
  return serverFetch<void>(`admin/notifications/${id}/mark-unread`, {
    method: "POST",
  });
}

export async function deleteNotification(id: string) {
  return serverFetch<void>(`admin/notifications/${id}`, { method: "DELETE" });
}
