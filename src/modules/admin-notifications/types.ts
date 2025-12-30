export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

// مطابق enum بک‌اند (Order=0..Vendor=5)
export type NotificationType = 0 | 1 | 2 | 3 | 4 | 5;

export type AdminNotificationListItemDto = {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  title: string;
  type: NotificationType;
  isRead: boolean;
  createdAtUtc: string;
  actionUrl?: string | null;
};

export type AdminSendNotificationDto = {
  target: "All" | "User" | "Role" | "Vendor";
  userId?: string | null;
  roleId?: string | null;
  vendorId?: string | null;
  title: string;
  message: string;
  type: NotificationType;
  actionUrl?: string | null;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
};
