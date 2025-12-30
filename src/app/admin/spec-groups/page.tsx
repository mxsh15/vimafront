import { AdminListPage } from "@/shared/components/AdminListPage";
import {
  listAttributeGroups,
  listAttributeSetOptions,
  listProductAttributes,
} from "@/modules/specs/api";
import type { AttributeGroupListItemDto } from "@/modules/specs/types";
import { AttributeGroupsCreateButton } from "@/modules/specs/ui/AttributeGroupsCreateButton";
import { AttributeGroupsRowMenuCell } from "@/modules/specs/ui/AttributeGroupsRowMenuCell";

export const metadata = {
  title: "گروه‌های ویژگی | پنل مدیریت",
};

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; attributeSetId?: string };
}) {
  const page = Number(searchParams.page ?? "1") || 1;
  const q = searchParams.q ?? "";
  const attributeSetId = searchParams.attributeSetId ?? "";
  const pageSize = 20;

  const [data, attributeSetOptions, allAttributes] = await Promise.all([
    listAttributeGroups({ page, pageSize, q, attributeSetId }),
    listAttributeSetOptions({ onlyActive: true }),
    listProductAttributes({ page: 1, pageSize: 1000 }),
  ]);

  const attributeOptions = allAttributes.items;

  const columns = [
    {
      id: "name",
      header: "نام گروه",
      cell: (row: AttributeGroupListItemDto) => row.name,
    },
    {
      id: "setName",
      header: "ست ویژگی",
      cell: (row: AttributeGroupListItemDto) => row.attributeSetName,
    },
    {
      id: "attributesCount",
      header: "تعداد ویژگی‌ها",
      cell: (row: AttributeGroupListItemDto) => row.attributesCount,
    },
    {
      id: "sortOrder",
      header: "ترتیب",
      cell: (row: AttributeGroupListItemDto) => row.sortOrder,
    },
  ];
  return (
    <AdminListPage<AttributeGroupListItemDto>
      title="گروه های ویژگی"
      subtitle="مدیریت گروه‌بندی مشخصات فنی محصولات"
      basePath="/admin/spec-groups"
      data={data}
      q={q}
      createButton={
        <AttributeGroupsCreateButton
          attributeSetOptions={attributeSetOptions}
          attributeOptions={attributeOptions}
        />
      }
      columns={columns}
      rowMenuCell={(row) => (
        <AttributeGroupsRowMenuCell
          row={row}
          attributeSetOptions={attributeSetOptions}
          attributeOptions={attributeOptions}
        />
      )}
      showStatusFilter={false}
      showTrashButton={false}
    />
  );
}
