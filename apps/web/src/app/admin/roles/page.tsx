import { AdminListPage } from "@/shared/components/AdminListPage";
import { RoleCreateButton } from "@/modules/role/ui/RoleCreateButton";
import { listRoles } from "@/modules/role/api";
import { RoleRowActionsMenu } from "@/modules/role/ui/RoleRowActionsMenu";
import { RoleRow } from "@/modules/role/types";

export const metadata = {
  title: "نقش‌ها | پنل مدیریت",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const q = params?.q ?? "";
  const status = params.status ?? undefined;
  const pageSize = 12;
  const data = await listRoles({ page, pageSize, q, status });

  return (
    <AdminListPage<RoleRow>
      title="نقش‌ها"
      subtitle="مدیریت نقش‌ها و دسترسی‌های کاربران"
      basePath="/admin/roles"
      data={data}
      q={q}
      createButton={<RoleCreateButton />}
      searchPlaceholder="جستجوی نقش..."
      enableStatusFilter={true}
      statusOptions={[
        { label: "همه", value: null },
        { label: "فعال", value: "active" },
        { label: "غیر فعال", value: "inactive" },
      ]}
      totalLabel={`${data.totalCount} نقش ثبت شده`}
      emptyMessage="نقشی ثبت نشده است."
      rowMenuHeader="عملیات"
      rowMenuCell={(row) => <RoleRowActionsMenu role={row} />}
      showTrashButton={true}
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

