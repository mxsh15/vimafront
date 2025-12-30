import { apiFetch } from "@/lib/api";
import type { TagDto, TagListItemDto, PagedResult } from "./types";
import { TagUpsertInput } from "./schemas";

export async function listTags(params?: {
  page?: number;
  pageSize?: number;
  q?: string;
}) {
  const sp = new URLSearchParams();
  sp.set("page", String(params?.page ?? 1));
  sp.set("pageSize", String(params?.pageSize ?? 20));
  if (params?.q) sp.set("q", params.q);

  return apiFetch<PagedResult<TagListItemDto>>(`tags?${sp}`);
}

export async function getTag(id: string) {
  return apiFetch<TagDto>(`tags/${id}`);
}

export async function upsertTag(input: TagUpsertInput) {
  const payload = {
    name: input.name,
    slug: input.slug,
    rowVersion: input.rowVersion,
  };

  if (input.id) {
    // ویرایش
    return apiFetch(`tags/${input.id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  // ایجاد جدید
  return apiFetch("tags", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteTag(id: string) {
  return apiFetch<void>(`tags/${id}`, {
    method: "DELETE",
  });
}


// لیست حذف‌شده‌ها
export async function listDeletedTags(params: {
  page: number;
  pageSize: number;
  q?: string;
}) {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("pageSize", String(params.pageSize));
  if (params.q) sp.set("q", params.q);

  return apiFetch<PagedResult<TagListItemDto>>(
    `tags/deleted?${sp.toString()}`
  );
}

// بازیابی
export async function restoreTag(id: string) {
  return apiFetch(`tags/${id}/restore`, { method: "POST" });
}

// حذف قطعی
export async function hardDeleteTag(id: string) {
  return apiFetch(`tags/${id}/hard`, { method: "DELETE" });
}
