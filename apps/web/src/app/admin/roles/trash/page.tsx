import { AdminListPage } from "@/shared/components/AdminListPage";
import { listDeletedRoles } from "@/modules/role/api";
import { RoleTrashRowActionsMenu } from "@/modules/role/ui/RoleTrashRowActionsMenu";
import { RoleRow } from "@/modules/role/types";

export const metadata = {
  title: "سطل زباله نقش‌ها | پنل مدیریت",
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
  const data = await listDeletedRoles({ page, pageSize, q });

  return (
    <AdminListPage<RoleRow>
      title="سطل زباله نقش‌ها"
      subtitle="نقش‌های حذف شده"
      basePath="/admin/roles/trash"
      data={data}
      q={q}
      searchPlaceholder="جستجوی نقش حذف شده..."
      enableStatusFilter={false}
      totalLabel={`${data.totalCount} نقش حذف شده`}
      emptyMessage="هیچ نقشی حذف نشده است."
      rowMenuHeader="عملیات"
      rowMenuCell={(row) => (
        <RoleTrashRowActionsMenu id={row.id} name={row.name} />
      )}
      showTrashButton={false}
      columns={[
        {
          id: "name",
          header: "نام نقش",
          cell: (r) => <span className="font-medium">{r.name}</span>,
          cellClassName: "px-2",
        },
        {
          id: "description",
          header: "توضیحات",
          cell: (r) => (
            <span className="text-sm text-slate-600">
              {r.description || "-"}
            </span>
          ),
          cellClassName: "px-4",
        },
        {
          id: "usersCount",
          header: "تعداد کاربران",
          cell: (r) => (
            <span className="text-sm text-slate-600">{r.usersCount}</span>
          ),
          cellClassName: "px-2",
        },
        {
          id: "permissionsCount",
          header: "تعداد دسترسی‌ها",
          cell: (r) => (
            <span className="text-sm text-slate-600">{r.permissionsCount}</span>
          ),
          cellClassName: "px-2",
        },
      ]}
    />
  );
}

