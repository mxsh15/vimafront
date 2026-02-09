import { AdminListPage } from "@/shared/components/AdminListPage";
import { PermissionCreateButton } from "@/modules/permission/ui/PermissionCreateButton";
import { listPermissions, getPermissionCategories } from "@/modules/permission/api";
import { PermissionRowActionsMenu } from "@/modules/permission/ui/PermissionRowActionsMenu";
import { PermissionRow } from "@/modules/permission/types";

export const metadata = {
  title: "دسترسی‌ها | پنل مدیریت",
};

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; category?: string; status?: string };
}) {
  const params = await searchParams;

  const page = Number(params.page ?? 1);
  const q = params?.q ?? "";
  const category = params.category ?? undefined;
  const status = params.status ?? undefined;
  const pageSize = 12;
  
  const [data, categories] = await Promise.all([
    listPermissions({ page, pageSize, q, category, status }),
    getPermissionCategories(),
  ]);

  return (
    <AdminListPage<PermissionRow>
      title="دسترسی‌ها"
      subtitle="مدیریت دسترسی‌های سیستم"
      basePath="/admin/permissions"
      data={data}
      q={q}
      createButton={<PermissionCreateButton />}
      searchPlaceholder="جستجوی دسترسی..."
      enableStatusFilter={true}
      statusOptions={[
        { label: "همه", value: null },
        { label: "فعال", value: "active" },
        { label: "غیر فعال", value: "inactive" },
      ]}
      totalLabel={`${data.totalCount} دسترسی ثبت شده`}
      emptyMessage="دسترسی‌ای ثبت نشده است."
      rowMenuHeader="عملیات"
      rowMenuCell={(row) => <PermissionRowActionsMenu permission={row} />}
      showTrashButton={true}
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
        {
          id: "rolesCount",
          header: "تعداد نقش‌ها",
          cell: (r) => (
            <span className="text-sm text-slate-600">{r.rolesCount}</span>
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

