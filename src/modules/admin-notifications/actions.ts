"use server";

import {
  sendAdminNotification,
  deleteNotification,
  markNotificationRead,
  markNotificationUnread,
} from "./api";
import type { AdminSendNotificationDto } from "./types";

export async function sendAdminNotificationAction(
  dto: AdminSendNotificationDto
) {
  return sendAdminNotification(dto);
}

export async function deleteNotificationAction(id: string) {
  return deleteNotification(id);
}

export async function markNotificationReadAction(id: string) {
  return markNotificationRead(id);
}

export async function markNotificationUnreadAction(id: string) {
  return markNotificationUnread(id);
}
