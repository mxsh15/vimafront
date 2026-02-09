import { AdminListPage } from "@/shared/components/AdminListPage";
import { listDeletedProducts } from "@/modules/product/api";
import { ProductTrashRowActionsMenu } from "@/modules/product/ui/ProductTrashRowActionsMenu";
import type { ProductListItemDto } from "@/modules/product/types";
import Link from "next/link";

export const metadata = {
  title: "سطل زباله محصولات | پنل مدیریت",
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
  const data = await listDeletedProducts({ page, pageSize, q });

  return (
    <AdminListPage<ProductListItemDto>
      title="سطل زباله محصولات"
      subtitle="محصولات حذف‌شده. می‌توانید آن‌ها را بازیابی یا برای همیشه حذف کنید."
      basePath="/admin/products/trash"
      data={data}
      q={q}
      createButton={
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          ← بازگشت به لیست محصولات
        </Link>
      }
      searchPlaceholder="جستجوی محصول حذف‌شده..."
      enableStatusFilter={false}
      totalLabel={`${data.totalCount} محصول در سطل زباله`}
      emptyMessage="محصول حذف‌شده‌ای وجود ندارد."
      rowMenuHeader="عملیات"
      rowMenuCell={(row) => (
        <ProductTrashRowActionsMenu id={row.id} title={row.title} />
      )}
      showTrashButton={false}
      columns={[
        {
          id: "title",
          header: "عنوان",
          cell: (r) => (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-900">{r.title}</span>
              {r.brandTitle && (
                <span className="text-[11px] text-slate-400">
                  برند: {r.brandTitle}
                </span>
              )}
            </div>
          ),
          cellClassName: "px-2",
        },
        {
          id: "slug",
          header: "نامک",
          cell: (r) => (
            <span className="font-mono text-xs text-slate-500">{r.slug}</span>
          ),
          cellClassName: "px-4",
        },
        {
          id: "sku",
          header: "SKU",
          cell: (r) => (
            <span className="text-xs text-slate-600">{r.sku ?? "-"}</span>
          ),
          cellClassName: "px-2",
        },
        {
          id: "status",
          header: "وضعیت قبل از حذف",
          cell: (r) => (
            <span className="text-[11px] text-slate-500">
              {r.status === 1 ? "منتشر شده" : r.status === 0 ? "پیش‌نویس" : "بایگانی شده"}
            </span>
          ),
          cellClassName: "px-2",
        },
      ]}
    />
  );
}

