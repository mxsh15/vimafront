export type UserDto = {
  id: string;
  email: string;
  phoneNumber?: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  role: number;
  roleId?: string | null;
  roleName?: string | null;
  vendorIds: string[];
  emailVerified: boolean;
  lastLoginAt?: string | null;
  createdAtUtc: string;
  status: boolean;
};

export type UserListItemDto = {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  role: number;
  roleId?: string | null;
  roleName?: string | null;
  emailVerified: boolean;
  lastLoginAt?: string | null;
  createdAtUtc: string;
  status: boolean;
};

export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type UserRow = {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  role: number;
  roleId?: string | null;
  roleName?: string | null;
  emailVerified: boolean;
  lastLoginAt?: string | null;
  createdAtUtc: string;
  status: boolean;
};

export type UserOptionDto = {
  id: string;
  fullName: string;
  email: string;
};

export type UserOptionDto2 = {
  id: string;
  fullName: string;
};

export type UserSelectProps = {
  name: string;
  label?: string;
  options: UserOptionDto[];
  defaultValue?: string | null;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};
