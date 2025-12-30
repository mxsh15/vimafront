import { AdminListPage } from "@/shared/components/AdminListPage";
import { listAttributeSets } from "@/modules/specs/api";
import type { AttributeSetListItemDto } from "@/modules/specs/types";
import { AttributeSetCreateButton } from "@/modules/specs/ui/AttributeSetCreateButton";
import { AttributeSetRowMenuCell } from "@/modules/specs/ui/AttributeSetRowMenuCell";

export const metadata = {
  title: "ست ویژگی‌ها | پنل مدیریت",
};

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const page = Number(searchParams.page ?? "1") || 1;
  const q = searchParams.q ?? "";
  const pageSize = 20;

  const data = await listAttributeSets({ page, pageSize, q });

  const columns = [
    {
      id: "name",
      header: "نام ست",
      cell: (row: AttributeSetListItemDto) => row.name,
    },
    {
      id: "description",
      header: "توضیحات",
      cell: (row: AttributeSetListItemDto) => row.description ?? "-",
    },
  ];
  return (
    <AdminListPage<AttributeSetListItemDto>
      title="ست ویژگی‌ها"
      subtitle="تعریف قالب کلی مشخصات برای انواع محصولات (مثلاً گوشی موبایل، لپ‌تاپ)"
      basePath="/admin/spec-sets"
      data={data}
      q={q}
      createButton={<AttributeSetCreateButton />}
      columns={columns}
      rowMenuCell={(row) => <AttributeSetRowMenuCell row={row} />}
      showStatusFilter={false}
      showTrashButton={false}
    />
  );
}
