import { listTags } from "@/modules/tag/api";
import { TagListItemDto } from "@/modules/tag/types";
import { TagCreateButton } from "@/modules/tag/ui/TagCreateButton";
import { TagRowMenuCell } from "@/modules/tag/ui/TagRowMenuCell";
import { AdminListPage } from "@/shared/components/AdminListPage";

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; };
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const q = params?.q ?? "";
  const data = await listTags({ page, pageSize: 20, q });

  const columns = [
    { id: "name", header: "نام", cell: (r: TagListItemDto) => r.name },
    { id: "slug", header: "نامک", cell: (r: TagListItemDto) => r.slug },
  ];

  return (
    <AdminListPage<TagListItemDto>
      title="برچسب‌ها"
      basePath="/admin/tags"
      data={data}
      q={q}
      createButton={<TagCreateButton />}
      columns={columns}
      rowMenuCell={(row) => <TagRowMenuCell tag={row} />}
      showTrashButton={true}
    />
  );
}
