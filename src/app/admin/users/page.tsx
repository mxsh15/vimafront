import { AdminListPage } from "@/shared/components/AdminListPage";
import { UserCreateButton } from "@/modules/user/ui/UserCreateButton";
import { listUsers } from "@/modules/user/api";
import { UserRowActionsMenu } from "@/modules/user/ui/UserRowActionsMenu";
import { UserRow } from "@/modules/user/types";
import { listRoleOptions } from "@/modules/role/api";
import { listVendorOptions } from "@/modules/vendor/api";

export const metadata = {
  title: "کاربران | پنل مدیریت",
};

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; role?: string; status?: string };
}) {
  const params = await searchParams;

  const page = Number(searchParams?.page ?? 1);
  const q = params?.q ?? "";
  const role = params.role ?? undefined;
  const status = params.status ?? undefined;
  const pageSize = 12;

  const [data, roleOptions, vendorOptions] = await Promise.all([
    listUsers({ page, pageSize, q, role, status }),
    listRoleOptions(),
    listVendorOptions(),
  ]);

  // Map vendor options
  const vendorOptionsMapped = vendorOptions.map((v) => ({
    id: v.id,
    storeName: v.storeName,
  }));

  return (
    <AdminListPage<UserRow>
      title="کاربران"
      subtitle="مدیریت و ویرایش کاربران سیستم"
      basePath="/admin/users"
      data={data}
      q={q}
      createButton={
        <UserCreateButton
          roleOptions={roleOptions}
          vendorOptions={vendorOptionsMapped}
        />
      }
      searchPlaceholder="جستجوی کاربر..."
      enableStatusFilter={true}
      statusOptions={[
        { label: "همه", value: null },
        { label: "فعال", value: "active" },
        { label: "غیر فعال", value: "inactive" },
      ]}
      totalLabel={`${data.totalCount} کاربر ثبت شده`}
      emptyMessage="کاربری ثبت نشده است."
      rowMenuHeader="عملیات"
      rowMenuCell={(row) => (
        <UserRowActionsMenu
          user={row}
          roleOptions={roleOptions}
          vendorOptions={vendorOptionsMapped}
        />
      )}
      showTrashButton={true}
      columns={[
        {
          id: "email",
          header: "ایمیل",
          cell: (r) => (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-900">{r.email}</span>
              {r.phoneNumber && (
                <span className="text-[11px] text-slate-400">{r.phoneNumber}</span>
              )}
            </div>
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
            <div className="flex flex-col">
              <span className="text-xs text-slate-600">
                {r.roleName || (r.role === 0 ? "مشتری" : r.role === 1 ? "فروشنده" : "مدیر")}
              </span>
            </div>
          ),
          cellClassName: "px-4",
        },
        {
          id: "emailVerified",
          header: "تایید ایمیل",
          cell: (r) => (
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                r.emailVerified
                  ? "border-emerald-100 bg-emerald-50 text-emerald-500"
                  : "border-slate-200 bg-slate-50 text-slate-400"
              }`}
            >
              {r.emailVerified ? "تایید شده" : "تایید نشده"}
            </span>
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

