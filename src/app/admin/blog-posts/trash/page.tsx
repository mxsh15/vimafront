import { AdminListPage } from "@/shared/components/AdminListPage";
import { listDeletedBlogPosts } from "@/modules/blog/api";
import { BlogPostTrashRowActionsMenu } from "@/modules/blog/ui/BlogPostTrashRowActionsMenu";
import type { BlogPostListItemDto } from "@/modules/blog/types";
import Link from "next/link";

export const metadata = {
    title: "سطل زباله نوشته‌ها | پنل مدیریت",
};

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string }>;
}) {
    const params = await searchParams;
    const page = Number(params?.page ?? 1);
    const q = params?.q ?? "";

    const data = await listDeletedBlogPosts({ page, pageSize: 20, q });

    return (
        <AdminListPage<BlogPostListItemDto>
            title="سطل زباله نوشته‌ها"
            basePath="/admin/blog-posts/trash"
            data={data}
            q={q}
            createButton={
                <Link
                    href="/admin/blog-posts"
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                    ← بازگشت به لیست نوشته های بلاگ
                </Link>
            }
            showTrashButton={false}
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => (
                <BlogPostTrashRowActionsMenu id={row.id} title={row.title} />
            )}
            columns={[
                {
                    id: "title",
                    header: "عنوان",
                    cell: (r) => r.title,
                    cellClassName: "px-2 text-xs",
                },
                {
                    id: "createdAt",
                    header: "تاریخ ایجاد",
                    cell: (r) =>
                        new Date(r.createdAtUtc).toLocaleDateString("fa-IR"),
                    cellClassName: "px-2 text-[11px] text-slate-400",
                },
                {
                    id: "status",
                    header: "وضعیت قبل از حذف",
                    cell: (r) => (
                        <span className="text-[11px] text-slate-500">
                            {r.status === 1
                                ? "منتشر شده"
                                : r.status === 0
                                    ? "پیش‌نویس"
                                    : "بایگانی شده"}
                        </span>
                    ),
                    cellClassName: "px-2",
                },
            ]}
        />
    );
}
