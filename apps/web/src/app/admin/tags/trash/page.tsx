import { AdminListPage } from "@/shared/components/AdminListPage";
import { listDeletedTags } from "@/modules/tag/api";
import { TagListItemDto } from "@/modules/tag/types";
import { TagTrashRowActionsMenu } from "@/modules/tag/ui/TagTrashRowActionsMenu";
import Link from "next/link";

export const metadata = {
  title: "سطل زباله برچسب‌ها | پنل مدیریت",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const sp = await searchParams;
  const page = Number(sp.page ?? "1");
  const q = sp.q ?? "";
  const pageSize = 20;

  const data = await listDeletedTags({ page, pageSize, q });

  return (
    <AdminListPage<TagListItemDto>
      title="سطل زباله برچسب‌ها"
      subtitle="برچسب‌های حذف‌شده. می‌توانید بازیابی یا حذف دائمی کنید."
      basePath="/admin/tags/trash"
      data={data}
      q={q}
      createButton={
        <Link
          href="/admin/tags"
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          ← بازگشت به لیست برچسب‌ها
        </Link>
      }
      searchPlaceholder="جستجوی تگ حذف‌شده..."
      enableStatusFilter={false}
      totalLabel={`${data.totalCount} برچسب در سطل زباله`}
      emptyMessage="تگ حذف‌شده‌ای وجود ندارد."
      rowMenuHeader="عملیات"
      rowMenuCell={(row) => (
        <TagTrashRowActionsMenu id={row.id} name={row.name} />
      )}
      showTrashButton={false}
      columns={[
        {
          id: "name",
          header: "نام",
          cell: (r) => <span className="font-medium">{r.name}</span>,
        },
        {
          id: "slug",
          header: "نامک",
          cell: (r) => (
            <span className="font-mono text-xs text-slate-600">{r.slug}</span>
          ),
        },
      ]}
    />
  );
}
