"use client";

import Link from "next/link";
import { AdminListPage } from "@/shared/components/AdminListPage";
import { useDeletedCategories } from "@/modules/category/hooks";
import { CategoryTrashRowActionsMenu } from "@/modules/category/ui/CategoryTrashRowActionsMenu";
import type { PagedResult } from "@/modules/brand/types";
import type { CategoryListItemDto } from "@/modules/category/types";

export function CategoriesTrashPageClient(props: {
  data: PagedResult<CategoryListItemDto>;
  q: string;
  page: number;
  pageSize: number;
}) {
  const { data, q, page, pageSize } = props;

  const trashQ = useDeletedCategories({ page, pageSize, q }, data);
  const list = trashQ.data ?? data;

  return (
    <AdminListPage<CategoryListItemDto>
      title="سطل زباله دسته‌بندی‌ها"
      subtitle="لیست دسته‌های حذف‌شده؛ می‌توانید آن‌ها را بازیابی یا به‌صورت دائمی حذف کنید."
      basePath="/admin/categories/trash"
      data={list}
      q={q}
      createButton={
        <Link
          href="/admin/categories"
          className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          ← بازگشت به لیست دسته‌ها
        </Link>
      }
      searchPlaceholder="جستجو در سطل زباله..."
      enableStatusFilter={false}
      totalLabel={`${list.totalCount} دسته در سطل زباله`}
      emptyMessage="هیچ دسته‌ای در سطل زباله نیست."
      rowMenuHeader="عملیات"
      rowMenuCell={(row) => <CategoryTrashRowActionsMenu category={row} />}
      columns={[
        {
          id: "title",
          header: "نام",
          cell: (r) => <span className="font-medium">{r.title}</span>,
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
      ]}
    />
  );
}
