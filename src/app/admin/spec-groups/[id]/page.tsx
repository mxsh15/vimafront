import { notFound } from "next/navigation";
import { getAttributeGroup, listProductAttributes } from "@/modules/specs/api";
import type { ProductAttributeListItemDto } from "@/modules/specs/types";
import { AdminListPage } from "@/shared/components/AdminListPage";
import { ProductAttributeCreateButton } from "@/modules/specs/ui/ProductAttributeCreateButton";
import { ProductAttributeRowMenuCell } from "@/modules/specs/ui/ProductAttributeRowMenuCell";
import Link from "next/link";

export const metadata = {
  title: "ویژگی‌ها | پنل مدیریت",
};

export default async function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { page?: string; q?: string };
}) {
  const resolvedParams = await params;
  const groupId = resolvedParams.id;

  const page = Number(searchParams.page ?? "1") || 1;
  const q = searchParams.q ?? "";
  const pageSize = 20;

  const [group, attributes] = await Promise.all([
    getAttributeGroup(groupId).catch(() => null),
    listProductAttributes({
      page,
      pageSize,
      q,
      attributeGroupId: groupId,
    }),
  ]);

  if (!group) return notFound();
  const columns = [
    {
      id: "name",
      header: "نام ویژگی",
      cell: (row: ProductAttributeListItemDto) => row.name,
    },
    {
      id: "key",
      header: "کلید",
      cell: (row: ProductAttributeListItemDto) => (
        <span className="font-mono text-xs text-slate-500">{row.key}</span>
      ),
    },
    {
      id: "valueType",
      header: "نوع مقدار",
      cell: (row: ProductAttributeListItemDto) => row.valueType,
    },
    {
      id: "sortOrder",
      header: "ترتیب",
      cell: (row: ProductAttributeListItemDto) => row.sortOrder,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/spec-groups"
          className="inline-flex items-center rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
        >
          ← بازگشت به گروه‌بندی ویژگی‌ها
        </Link>
      </div>
      <AdminListPage<ProductAttributeListItemDto>
        title={`ویژگی‌های گروه: ${group.name}`}
        subtitle={`ست: ${group.attributeSetName}`}
        basePath={`/admin/spec-groups/${groupId}`}
        data={attributes}
        q={q}
        createButton={<ProductAttributeCreateButton groupId={groupId} />}
        columns={columns}
        rowMenuCell={(row) => <ProductAttributeRowMenuCell attribute={row} />}
        showStatusFilter={false}
        showTrashButton={false}
      />
    </div>
  );
}
