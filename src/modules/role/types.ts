export type RoleDto = {
  id: string;
  name: string;
  description?: string | null;
  createdAtUtc: string;
  status: boolean;
};

export type RoleListItemDto = {
  id: string;
  name: string;
  description?: string | null;
  usersCount: number;
  permissionsCount: number;
  createdAtUtc: string;
  status: boolean;
};

export type RoleDetailDto = {
  id: string;
  name: string;
  description?: string | null;
  permissions: PermissionDto[];
  createdAtUtc: string;
  status: boolean;
};

export type PermissionDto = {
  id: string;
  name: string;
  displayName?: string | null;
  category?: string | null;
};

export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type RoleRow = {
  id: string;
  name: string;
  description?: string | null;
  usersCount: number;
  permissionsCount: number;
  createdAtUtc: string;
  status: boolean;
};

export type RoleOptionDto = {
  id: string;
  name: string;
};

