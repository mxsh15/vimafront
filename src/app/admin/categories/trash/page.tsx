import Link from "next/link";
import { AdminListPage } from "@/shared/components/AdminListPage";
import { listDeletedCategories } from "@/modules/category/api";
import { CategoryListItemDto } from "@/modules/category/types";
import { CategoryTrashRowActionsMenu } from "@/modules/category/ui/CategoryTrashRowActionsMenu";

export const metadata = {
  title: "سطل زباله دسته‌بندی‌ها | پنل مدیریت",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const q = params.q ?? "";
  const pageSize = 20;

  const data = await listDeletedCategories({ page, pageSize, q });

  return (
    <AdminListPage<CategoryListItemDto>
      title="سطل زباله دسته‌بندی‌ها"
      subtitle="لیست دسته‌های حذف‌شده؛ می‌توانید آن‌ها را بازیابی یا به‌صورت دائمی حذف کنید."
      basePath="/admin/categories/trash"
      data={data}
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
      totalLabel={`${data.totalCount} دسته در سطل زباله`}
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
