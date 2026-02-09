export type TagListItemDto = {
  id: string;
  name: string;
  slug: string;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  isDeleted: boolean;
  rowVersion: string;
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
};
