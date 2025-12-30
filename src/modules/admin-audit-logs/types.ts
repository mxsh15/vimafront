export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type AdminAuditLogListItemDto = {
  id: string;
  createdAtUtc: string;
  userId?: string | null;
  userEmail?: string | null;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
};

export type AdminAuditLogDetailDto = {
  id: string;
  createdAtUtc: string;
  userId?: string | null;
  userEmail?: string | null;
  method: string;
  path: string;
  queryString?: string | null;
  statusCode: number;
  durationMs: number;
  ipAddress?: string | null;
  userAgent?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  action?: string | null;
  notes?: string | null;
};
