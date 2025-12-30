import { AdminListPage } from "@/shared/components/AdminListPage";
import { VendorCreateButton } from "@/modules/vendor/ui/VendorCreateButton";
import { listVendors } from "@/modules/vendor/api";
import { VendorRowActionsMenu } from "@/modules/vendor/ui/VendorRowActionsMenu";
import { VendorRow } from "@/modules/vendor/types";
import { listUserOptions } from "@/modules/user/api";
import Link from "next/link";

export const metadata = {
  title: "فروشندگان | پنل مدیریت",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const q = params.q ?? "";
  const status = params.status ?? undefined;
  const pageSize = 12;

  const [data, userOptions] = await Promise.all([
    listVendors({ page, pageSize, q, status }),
    listUserOptions(),
  ]);

  return (
    <AdminListPage<VendorRow>
      title="فروشندگان"
      subtitle="مدیریت و ویرایش فروشندگان ثبت شده در فروشگاه"
      basePath="/admin/vendors"
      data={data}
      q={q}
      createButton={
        <VendorCreateButton userOptions={userOptions} />
      }
      searchPlaceholder="جستجوی فروشنده..."
      enableStatusFilter={true}
      statusOptions={[
        { label: "همه", value: null },
        { label: "فعال", value: "active" },
        { label: "غیر فعال", value: "inactive" },
      ]}
      totalLabel={`${data.totalCount} فروشنده ثبت شده`}
      emptyMessage="فروشنده‌ای ثبت نشده است."
      rowMenuHeader="عملیات"
      rowMenuCell={(row) => <VendorRowActionsMenu vendor={row} />}
      showTrashButton={true}
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
          id: "members",
          header: "اعضا",
          cell: (r) => (
            <Link
              href={`/admin/vendors/${r.id}/members`}
              className="rounded-xl border border-slate-200 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
            >
              مدیریت اعضا 
            </Link>
          ),
          cellClassName: "px-2",
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
          id: "ordersCount",
          header: "تعداد سفارشات",
          cell: (r) => (
            <span className="text-sm text-slate-600">{r.ordersCount}</span>
          ),
          cellClassName: "px-2",
        },
        {
          id: "status",
          header: "وضعیت",
          cell: (r) => (
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${r.status
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
