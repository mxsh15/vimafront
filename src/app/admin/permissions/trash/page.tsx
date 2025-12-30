import { AdminListPage } from "@/shared/components/AdminListPage";
import { listDeletedPermissions } from "@/modules/permission/api";
import { PermissionTrashRowActionsMenu } from "@/modules/permission/ui/PermissionTrashRowActionsMenu";
import { PermissionRow } from "@/modules/permission/types";

export const metadata = {
  title: "سطل زباله دسترسی‌ها | پنل مدیریت",
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
  const data = await listDeletedPermissions({ page, pageSize, q });

  return (
    <AdminListPage<PermissionRow>
      title="سطل زباله دسترسی‌ها"
      subtitle="دسترسی‌های حذف شده"
      basePath="/admin/permissions/trash"
      data={data}
      q={q}
      searchPlaceholder="جستجوی دسترسی حذف شده..."
      enableStatusFilter={false}
      totalLabel={`${data.totalCount} دسترسی حذف شده`}
      emptyMessage="هیچ دسترسی حذف شده‌ای وجود ندارد."
      rowMenuHeader="عملیات"
      rowMenuCell={(row) => (
        <PermissionTrashRowActionsMenu id={row.id} name={row.name} />
      )}
      showTrashButton={false}
      columns={[
        {
          id: "name",
          header: "نام (کد)",
          cell: (r) => (
            <span className="font-mono text-xs text-slate-600">{r.name}</span>
          ),
          cellClassName: "px-2",
        },
        {
          id: "displayName",
          header: "نام نمایشی",
          cell: (r) => (
            <span className="font-medium">
              {r.displayName || r.name}
            </span>
          ),
          cellClassName: "px-2",
        },
        {
          id: "category",
          header: "دسته‌بندی",
          cell: (r) => (
            <span className="text-xs text-slate-500">
              {r.category || "-"}
            </span>
          ),
          cellClassName: "px-4",
        },
      ]}
    />
  );
}

