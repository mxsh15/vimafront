import { AdminListPage } from "@/shared/components/AdminListPage";
import { listDeletedUsers } from "@/modules/user/api";
import { UserTrashRowActionsMenu } from "@/modules/user/ui/UserTrashRowActionsMenu";
import { UserRow } from "@/modules/user/types";

export const metadata = {
  title: "سطل زباله کاربران | پنل مدیریت",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const sp = await searchParams;

  const page = Number(sp.page ?? "1");
  const q = sp.q ?? "";
const pageSize = 12;
  const data = await listDeletedUsers({ page, pageSize, q });

  return (
    <AdminListPage<UserRow>
      title="سطل زباله کاربران"
      subtitle="کاربران حذف شده"
      basePath="/admin/users/trash"
      data={data}
      q={q}
      searchPlaceholder="جستجوی کاربر حذف شده..."
      enableStatusFilter={false}
      totalLabel={`${data.totalCount} کاربر حذف شده`}
      emptyMessage="هیچ کاربر حذف شده‌ای وجود ندارد."
      rowMenuHeader="عملیات"
      rowMenuCell={(row) => (
        <UserTrashRowActionsMenu id={row.id} fullName={row.fullName} />
      )}
      showTrashButton={false}
      columns={[
        {
          id: "email",
          header: "ایمیل",
          cell: (r) => (
            <span className="text-sm font-medium text-slate-900">{r.email}</span>
          ),
          cellClassName: "px-2",
        },
        {
          id: "fullName",
          header: "نام و نام خانوادگی",
          cell: (r) => <span className="font-medium">{r.fullName}</span>,
          cellClassName: "px-2",
        },
        {
          id: "role",
          header: "نقش",
          cell: (r) => (
            <span className="text-xs text-slate-600">
              {r.roleName || (r.role === 0 ? "مشتری" : r.role === 1 ? "فروشنده" : "مدیر")}
            </span>
          ),
          cellClassName: "px-4",
        },
        {
          id: "status",
          header: "وضعیت قبل از حذف",
          cell: (r) => (
            <span className="text-[11px] text-slate-500">
              {r.status ? "فعال" : "غیرفعال"}
            </span>
          ),
          cellClassName: "px-2",
        },
      ]}
    />
  );
}

