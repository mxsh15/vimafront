export type PermissionDto = {
  id: string;
  name: string;
  displayName?: string | null;
  description?: string | null;
  category?: string | null;
  createdAtUtc: string;
  status: boolean;
};

export type PermissionListItemDto = {
  id: string;
  name: string;
  displayName?: string | null;
  category?: string | null;
  rolesCount: number;
  createdAtUtc: string;
  status: boolean;
};

export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type PermissionRow = {
  id: string;
  name: string;
  displayName?: string | null;
  category?: string | null;
  rolesCount: number;
  createdAtUtc: string;
  status: boolean;
};

export type PermissionOptionDto = {
  id: string;
  name: string;
  displayName?: string | null;
  category?: string | null;
};

