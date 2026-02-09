"use client";

import * as React from "react";
import { AdminListPage } from "@/shared/components/AdminListPage";
import { UserCreateButton } from "@/modules/user/ui/UserCreateButton";
import { UserRowActionsMenu } from "@/modules/user/ui/UserRowActionsMenu";
import { useUsers } from "@/modules/user/hooks";
import type { UserRow } from "@/modules/user/types";
import type { PagedResult } from "@/modules/brand/types";

type RoleOption = { id: string; name: string };
type VendorOption = { id: string; storeName: string };

export function UsersPageClient(props: {
  data: PagedResult<UserRow>;
  q: string;
  page: number;
  pageSize: number;
  role?: string;
  status?: string;
  roleOptions: RoleOption[];
  vendorOptions: VendorOption[];
}) {
  const { data, q, page, pageSize, role, status, roleOptions, vendorOptions } =
    props;

  const usersQ = useUsers({ page, pageSize, q, role, status }, data);
  const list = usersQ.data ?? data;
  const roleValueByEnum: Record<number, string> = {
    0: "Customer",
    1: "Vendor",
    2: "Admin",
  };
  const roleLabelByEnum: Record<number, string> = {
    0: "مشتری",
    1: "فروشنده",
    2: "مدیر",
  };

  const roleFilterOptions = React.useMemo(() => {
    const set = new Set<number>();
    for (const u of list.items) if (typeof u.role === "number") set.add(u.role);

    return [
      { label: "همه", value: null as string | null },
      ...Array.from(set)
        .sort((a, b) => a - b)
        .map((r) => ({
          label: roleLabelByEnum[r] ?? `نقش ${r}`,
          value: roleValueByEnum[r] ?? String(r),
        })),
    ];
  }, [list.items]);

  return (
    <AdminListPage<UserRow>
      title="کاربران"
      subtitle="مدیریت و ویرایش کاربران سیستم"
      basePath="/admin/users"
      data={list}
      q={q}
      createButton={
        <UserCreateButton
          roleOptions={roleOptions}
          vendorOptions={vendorOptions}
        />
      }
      searchPlaceholder="جستجوی کاربر..."
      enableStatusFilter={false}
      totalLabel={`${list.totalCount} کاربر ثبت شده`}
      emptyMessage="کاربری ثبت نشده است."
      rowMenuHeader="عملیات"
      rowMenuCell={(row) => (
        <UserRowActionsMenu
          user={row}
          roleOptions={roleOptions}
          vendorOptions={vendorOptions}
        />
      )}
      showTrashButton={true}
      trashHref="/admin/users/trash"
      trashLabel="سطل زباله"
      filterBars={[
        {
          paramKey: "status",
          label: "وضعیت:",
          options: [
            { label: "همه", value: null },
            { label: "فعال", value: "active" },
            { label: "غیرفعال", value: "inactive" },
          ],
        },
        {
          paramKey: "role",
          label: "نقش:",
          options: roleFilterOptions,
        },
      ]}
      columns={[
        {
          id: "email",
          header: "ایمیل",
          cell: (r) => (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-900">
                {r.email}
              </span>
              {r.phoneNumber && (
                <span className="text-[11px] text-slate-400">
                  {r.phoneNumber}
                </span>
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
            <span className="text-xs text-slate-600">
              {r.roleName ||
                (r.role === 0 ? "مشتری" : r.role === 1 ? "فروشنده" : "مدیر")}
            </span>
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
              {r.status ? "فعال" : "غیرفعال"}
            </span>
          ),
          cellClassName: "px-2",
        },
      ]}
    />
  );
}
