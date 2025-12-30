import { ReactNode } from "react";

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount?: number;
  total?: number;
};

export type Column<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
};

export type AdminListPageProps<T> = {
  // header
  title: string;
  subtitle?: string;
  createButton?: ReactNode;

  // data
  basePath: string;
  data: PagedResult<T>;
  q?: string;

  // table
  columns: Column<T>[];
  rowMenuCell?: (row: T) => ReactNode;
  rowMenuHeader?: ReactNode;
  showIndex?: boolean;
  emptyMessage?: string;

  // status filter
  enableStatusFilter?: boolean;
  statusOptions?: { label: string; value: string | null }[];
  totalLabel?: string;

  // سرچ
  searchPlaceholder?: string;

  // 🔵 سطل زباله
  showTrashButton?: boolean;
  trashHref?: string;
  trashLabel?: string;
};
