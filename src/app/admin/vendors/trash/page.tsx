import { AdminListPage } from "@/shared/components/AdminListPage";
import { listDeletedVendors } from "@/modules/vendor/api";
import { VendorTrashRowActionsMenu } from "@/modules/vendor/ui/VendorTrashRowActionsMenu";
import { VendorRow } from "@/modules/vendor/types";

export const metadata = {
  title: "سطل زباله فروشندگان | پنل مدیریت",
};

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const params = await searchParams;

  const page = Number(searchParams?.page ?? 1);
  const q = params?.q ?? "";
  const pageSize = 12;
  const data = await listDeletedVendors({ page, pageSize, q });

  return (
    <AdminListPage<VendorRow>
      title="سطل زباله فروشندگان"
      subtitle="فروشندگان حذف شده"
      basePath="/admin/vendors/trash"
      data={data}
      q={q}
      searchPlaceholder="جستجوی فروشنده حذف شده..."
      enableStatusFilter={false}
      totalLabel={`${data.totalCount} فروشنده حذف شده`}
      emptyMessage="هیچ فروشنده حذف شده‌ای وجود ندارد."
      rowMenuHeader="عملیات"
      rowMenuCell={(row) => (
        <VendorTrashRowActionsMenu id={row.id} storeName={row.storeName} />
      )}
      showTrashButton={false}
      columns={[
        {
          id: "storeName",
          header: "نام فروشگاه",
          cell: (r) => <span className="font-medium">{r.storeName}</span>,
          cellClassName: "px-2",
        },
        {
          id: "owner",
          header: "مالک",
          cell: (r) => (
            <span className="text-sm text-slate-600">
              {r.ownerUserName || "-"}
            </span>
          ),
          cellClassName: "px-4",
        },
        {
          id: "productsCount",
          header: "تعداد محصولات",
          cell: (r) => (
            <span className="text-sm text-slate-600">{r.productsCount}</span>
          ),
          cellClassName: "px-2",
        },
        {
          id: "status",
          header: "وضعیت",
          cell: (r) => (
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                r.status
                  ? "border-emerald-100 bg-emerald-50 text-emerald-500"
                  : "border-slate-200 bg-slate-50 text-slate-400"
              }`}
            >
              {r.status ? "فعال" : "غیر فعال"}
            </span>
          ),
          cellClassName: "px-2",
        },
      ]}
    />
  );
}

