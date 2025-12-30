"use client";

import { AdminListPage } from "@/shared/components/AdminListPage";
import BrandModalButton from "@/modules/brand/ui/BrandModalButton";
import { BrandRowActionsMenu } from "@/modules/brand/ui/BrandRowActionsMenu";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import { BrandListItemDto } from "@/modules/brand/types";
import { PermissionGuard } from "@/shared/components/PermissionGuard";
import { PagedResult } from "@/modules/brand/types";
import { usePermissions } from "@/context/PermissionContext";

type BrandsPageClientProps = {
  data: PagedResult<BrandListItemDto>;
  q: string;
};

export function BrandsPageClient({ data, q }: BrandsPageClientProps) {
  const { hasPermission } = usePermissions();
  return (
    <AdminListPage<BrandListItemDto>
      title="برند ها"
      subtitle="مدیریت و ویرایش برندهای ثبت شده در فروشگاه"
      basePath="/admin/brands"
      data={data}
      q={q}
      createButton={
        <PermissionGuard permission="brands.create">
          <BrandModalButton
            asHeader
            triggerVariant="primary"
            className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-700"
          />
        </PermissionGuard>
      }
      searchPlaceholder="جستجوی برند..."
      enableStatusFilter={true}
      statusOptions={[
        { label: "همه", value: null },
        { label: "فعال", value: "active" },
        { label: "غیر فعال", value: "inactive" },
      ]}
      totalLabel={`${data.totalCount} برند ثبت شده`}
      emptyMessage="برندی ثبت نشده است."
      rowMenuHeader="عملیات"
      rowMenuCell={(row) => (
        <PermissionGuard permission="brands.view">
          <BrandRowActionsMenu brand={row} />
        </PermissionGuard>
      )}
      showTrashButton={hasPermission("brands.trash.view")}
      trashHref="/admin/brands/trash"
      columns={[
        {
          id: "logo",
          header: "لوگو",
          cell: (r) =>
            r.logoUrl ? (
              <img
                src={resolveMediaUrl(r.logoUrl)}
                alt={r.title}
                className="h-6 w-auto object-contain"
              />
            ) : (
              <span className="text-[10px] text-slate-400">بدون لوگو</span>
            ),
          cellClassName: "px-4",
        },
        {
          id: "name",
          header: "نام",
          cell: (r) => <span className="font-medium">{r.title}</span>,
          cellClassName: "px-2",
        },
        {
          id: "slug",
          header: "نامک",
          cell: (r) => <span className="font-medium">{r.slug}</span>,
          cellClassName: "px-4",
        },
        {
          id: "status",
          header: "وضعیت",
          cell: (r) => (
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                (r as any).isActive
                  ? "border-emerald-100 bg-emerald-50 text-emerald-500"
                  : "border-slate-200 bg-slate-50 text-slate-400"
              }`}
            >
              {(r as any).isActive ? "فعال" : "غیر فعال"}
            </span>
          ),
          cellClassName: "px-2",
        },
      ]}
    />
  );
}

