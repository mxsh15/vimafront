"use client";

import * as React from "react";
import { AdminListPage } from "@/shared/components/AdminListPage";
import { useCategories } from "@/modules/category/hooks";
import { CategoryCreateButton } from "@/modules/category/ui/CategoryCreateButton";
import { CategoryRowActionsMenu } from "@/modules/category/ui/CategoryRowActionsMenu";
import type { PagedResult } from "@/modules/brand/types";
import type {
  CategoryListItemDto,
  CategoryOptionDto,
  CategoryRowWithLevel,
} from "@/modules/category/types";

export function CategoriesPageClient(props: {
  data: PagedResult<CategoryListItemDto>;
  q: string;
  page: number;
  pageSize: number;
  parentOptions: CategoryOptionDto[];
}) {
  const { data, q, page, pageSize, parentOptions } = props;

  const categoriesQ = useCategories({ page, pageSize, q }, data);
  const list = categoriesQ.data ?? data;

  const dataWithLevel: PagedResult<CategoryRowWithLevel> = React.useMemo(() => {
    const items = list.items;
    
    const byId = new Map<string, CategoryListItemDto>();
    for (const c of items) byId.set(c.id, c);

    const children = new Map<string, CategoryListItemDto[]>();
    const roots: CategoryListItemDto[] = [];
    const orphans: CategoryListItemDto[] = [];

    for (const c of items) {
      const pid = c.parentId ?? "";
      if (!pid) {
        roots.push(c);
        continue;
      }

      if (!byId.has(pid)) {
        orphans.push(c);
        continue;
      }

      const arr = children.get(pid) ?? [];
      arr.push(c);
      children.set(pid, arr);
    }

    const siblingSort = (a: CategoryListItemDto, b: CategoryListItemDto) => {
      const sa = a.sortOrder ?? 0;
      const sb = b.sortOrder ?? 0;
      if (sa !== sb) return sa - sb;
      return (a.title ?? "").localeCompare(b.title ?? "", "fa");
    };

    roots.sort(siblingSort);
    for (const [, arr] of children) arr.sort(siblingSort);
    orphans.sort(siblingSort);

    const out: CategoryRowWithLevel[] = [];
    const visited = new Set<string>();

    const dfs = (node: CategoryListItemDto, level: number) => {
      if (visited.has(node.id)) return; 
      visited.add(node.id);

      out.push({ ...node, level });

      const kids = children.get(node.id);
      if (!kids?.length) return;

      for (const k of kids) dfs(k, level + 1);
    };

    for (const r of roots) dfs(r, 0);

    for (const o of orphans) dfs(o, 0);

    for (const c of items) {
      if (!visited.has(c.id)) dfs(c, 0);
    }

    return {
      ...list,
      items: out,
      totalCount: list.totalCount,
      page: list.page,
      pageSize: list.pageSize,
    };
  }, [list]);

  return (
    <AdminListPage<CategoryRowWithLevel>
      title="دسته‌بندی‌ها"
      subtitle="مدیریت و ویرایش دسته‌های محصولات فروشگاه"
      basePath="/admin/categories"
      data={dataWithLevel}
      q={q}
      createButton={<CategoryCreateButton parentOptions={parentOptions} />}
      searchPlaceholder="جستجوی دسته..."
      enableStatusFilter={false}
      totalLabel={`${dataWithLevel.totalCount} دسته ثبت شده`}
      emptyMessage="هیچ دسته‌ای ثبت نشده است."
      rowMenuHeader="عملیات"
      rowMenuCell={(row) => (
        <CategoryRowActionsMenu category={row} parentOptions={parentOptions} />
      )}
      showTrashButton={true}
      trashHref="/admin/categories/trash"
      trashLabel="سطل زباله"
      columns={[
        {
          id: "title",
          header: "نام",
          cell: (r) => (
            <div className="flex items-center">
              <span
                style={{ paddingRight: r.level * 16 }}
                className="flex items-center"
              >
                {r.level > 0 && (
                  <span className="ml-2 inline-block h-px w-4 bg-slate-300" />
                )}
                <span
                  className={
                    r.level === 0
                      ? "font-medium text-slate-900"
                      : "font-medium text-slate-700"
                  }
                >
                  {r.title}
                </span>
              </span>
            </div>
          ),
          cellClassName: "px-2",
        },
        {
          id: "slug",
          header: "نامک",
          cell: (r) => (
            <span className="font-mono text-xs text-slate-600">{r.slug}</span>
          ),
          cellClassName: "px-4",
        },
        {
          id: "sortOrder",
          header: "ترتیب",
          cell: (r) => (
            <span className="text-[11px] text-slate-400">{r.sortOrder}</span>
          ),
          cellClassName: "px-2",
        },
        {
          id: "status",
          header: "وضعیت",
          cell: (r) => (
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                r.isActive
                  ? "border-emerald-100 bg-emerald-50 text-emerald-500"
                  : "border-slate-200 bg-slate-50 text-slate-400"
              }`}
            >
              {r.isActive ? "فعال" : "غیرفعال"}
            </span>
          ),
          cellClassName: "px-2",
        },
      ]}
    />
  );
}
