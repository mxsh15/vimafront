import Link from "next/link";
import { AdminListPage } from "@/shared/components/AdminListPage";
import { listDeletedBlogTags } from "@/modules/blog-taxonomy/api";
import { BlogTagTrashRowActionsMenu } from "@/modules/blog-taxonomy/ui/BlogTagTrashRowActionsMenu";

export const metadata = { title: "سطل زباله برچسب‌ها | پنل مدیریت" };

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string }>;
}) {
    const params = await searchParams;
    const page = Number(params?.page ?? 1);
    const q = params?.q ?? "";

    const data = await listDeletedBlogTags({ page, pageSize: 20, q });

    return (
        <AdminListPage<any>
            title="سطل زباله برچسب‌ها"
            basePath="/admin/blog-tags/trash"
            data={data}
            q={q}
            createButton={
                <Link
                    href="/admin/blog-tags"
                    className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                    ← بازگشت به لیست برچسب ها
                </Link>
            }
            showTrashButton={false}
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => (
                <BlogTagTrashRowActionsMenu id={row.id} title={row.name} />
            )}
            columns={[
                { id: "name", header: "نام", cell: (r) => r.name, cellClassName: "px-2 text-xs" },
                { id: "slug", header: "اسلاگ", cell: (r) => r.slug, cellClassName: "px-2 text-[11px] text-slate-500" },
                {
                    id: "deletedAtUtc",
                    header: "تاریخ حذف",
                    cell: (r) => (r.deletedAtUtc ? new Date(r.deletedAtUtc).toLocaleDateString("fa-IR") : "-"),
                    cellClassName: "px-2 text-[11px] text-slate-400",
                },
            ]}
        />
    );
}
