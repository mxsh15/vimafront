import { AdminListPage } from "@/shared/components/AdminListPage";
import { listProductAttributes } from "@/modules/specs/api";
import type { ProductAttributeListItemDto } from "@/modules/specs/types";
import { ProductAttributeCreateButton } from "@/modules/specs/ui/ProductAttributeCreateButton";
import { ProductAttributeRowActionsMenu } from "@/modules/specs/ui/ProductAttributeRowActionsMenu";


export const metadata = {
  title: "ویژگی‌ها | پنل مدیریت",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const q = params.q ?? "";
  const pageSize = 20;

  const data = await listProductAttributes({ page, pageSize, q });

  return (
    <AdminListPage<ProductAttributeListItemDto>
      title="ویژگی‌ها"
      subtitle="مدیریت و ویرایش ویژگی‌های محصولات (مثل ووکامرس)"
      basePath="/admin/spec-attributes"
      data={data}
      q={q}
      createButton={
        <div className="flex items-center gap-2">
          <ProductAttributeCreateButton groupId={""} />
        </div>
      }
      searchPlaceholder="جستجوی ویژگی..."
      enableStatusFilter={false}
      totalLabel={`${data.totalCount} ویژگی ثبت شده`}
      emptyMessage="هنوز هیچ ویژگی‌ای ثبت نشده است."
      rowMenuHeader="عملیات"
      rowMenuCell={(row) => (
        <ProductAttributeRowActionsMenu attribute={row} />
      )}
      showTrashButton={true}
      trashHref="/admin/spec-attributes/trash"
      trashLabel="سطل زباله"
      columns={[
        {
          id: "name",
          header: "نام",
          cell: (r) => <span className="font-medium">{r.name}</span>,
        },
        {
          id: "key",
          header: "نامک",
          cell: (r) => (
            <span className="font-mono text-xs text-slate-500">{r.key}</span>
          ),
        },
        {
          id: "valueType",
          header: "نوع مقدار",
          cell: (r) => (
            <span className="text-[11px] text-slate-500">
              {r.valueType === 5
                ? "گزینه‌ای"
                : r.valueType === 6
                  ? "چندگزینه‌ای"
                  : "ساده"}
            </span>
          ),
        },
        {
          id: "sortOrder",
          header: "ترتیب",
          cell: (r) => (
            <span className="text-[11px] text-slate-400">{r.sortOrder}</span>
          ),
        },
      ]}
    />
  );
}
