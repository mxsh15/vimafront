import { AdminListPage } from "@/shared/components/AdminListPage";
import { listDeletedBrands } from "@/modules/brand/api";
import { BrandTrashRowActionsMenu } from "@/modules/brand/ui/BrandTrashRowActionsMenu";
import { BrandRow } from "@/modules/brand/types";
import Link from "next/link";

export const metadata = {
  title: "سطل زباله برندها | پنل مدیریت",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const q = params.q ?? "";
  const pageSize = 12;
  const data = await listDeletedBrands({ page, pageSize, q });

  return (
    <AdminListPage<BrandRow>
      title="سطل زباله برندها"
      subtitle="برندهای حذف‌شده. می‌توانید آن‌ها را بازیابی یا برای همیشه حذف کنید."
      basePath="/admin/brands/trash"
      data={data}
      q={q}
      createButton={
        <Link
          href="/admin/brands"
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          ← بازگشت به لیست برندها
        </Link>
      }
      searchPlaceholder="جستجوی برند حذف‌شده..."
      enableStatusFilter={false}
      totalLabel={`${data.totalCount} برند در سطل زباله`}
      emptyMessage="برند حذف‌شده‌ای وجود ندارد."
      rowMenuHeader="عملیات"
      rowMenuCell={(row) => (
        <BrandTrashRowActionsMenu id={row.id} title={row.title} />
      )}
      showTrashButton={false}
      columns={[
        {
          id: "name",
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
        {
          id: "status",
          header: "وضعیت قبل از حذف",
          cell: (r) => (
            <span className="text-[11px] text-slate-500">
              {r.isActive ? "فعال" : "غیرفعال"}
            </span>
          ),
          cellClassName: "px-2",
        },
      ]}
    />
  );
}
