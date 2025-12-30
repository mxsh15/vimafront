import { listBlogPosts } from "@/modules/blog/api";
import { AdminListPage } from "@/shared/components/AdminListPage";
import type { BlogPostListItemDto } from "@/modules/blog/types";
import { BlogPostCreateButton } from "@/modules/blog/ui/BlogPostCreateButton";
import { BlogPostRowMenuCell } from "@/modules/blog/ui/BlogPostRowMenuCell";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import {
    listBlogCategoriesOptions,
    listBlogTagsOptions,
} from "@/modules/blog-taxonomy/api";
import { listUserOptions } from "@/modules/user/api";

export const metadata = {
    title: "نوشته‌های بلاگ | پنل مدیریت",
};

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string }>;
}) {
    const params = await searchParams;
    const page = Number(params?.page ?? 1);
    const q = params?.q ?? "";

    const [data, categoryOptions, tagOptions, userOptions] = await Promise.all([
        listBlogPosts({ page, pageSize: 20, q }),
        listBlogCategoriesOptions(),
        listBlogTagsOptions(),
        listUserOptions().catch(() => []),
    ]);

    return (
        <AdminListPage<BlogPostListItemDto>
            title="نوشته‌های بلاگ"
            subtitle="مدیریت مقالات و نوشته‌های سایت"
            basePath="/admin/blog-posts"
            data={data}
            q={q}
            createButton={
                <BlogPostCreateButton
                    categoryOptions={categoryOptions}
                    tagOptions={tagOptions}
                    authorOptions={userOptions ?? []}
                />
            }
            showTrashButton={true}
            trashHref="/admin/blog-posts/trash"
            trashLabel="سطل زباله نوشته‌ها"
            searchPlaceholder="جستجوی نوشته..."
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => <BlogPostRowMenuCell
                row={row}
                categoryOptions={categoryOptions}
                tagOptions={tagOptions}
                authorOptions={userOptions ?? []}
            />}
            columns={[
                {
                    id: "thumbnail",
                    header: "تصویر",
                    cell: (r) =>
                        r.thumbnailImageUrl ? (
                            <img
                                src={resolveMediaUrl(r.thumbnailImageUrl)}
                                alt={r.title}
                                className="h-10 w-10 rounded-lg object-cover"
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-lg bg-slate-100" />
                        ),
                    cellClassName: "px-2",
                },
                {
                    id: "title",
                    header: "عنوان نوشته",
                    cell: (r) => (
                        <div className="space-y-0.5">
                            <div className="text-xs font-medium text-slate-900">{r.title}</div>
                            <div className="text-[10px] text-slate-400">
                                {r.slug}
                            </div>
                        </div>
                    ),
                    cellClassName: "px-2",
                },
                {
                    id: "author",
                    header: "نویسنده",
                    cell: (r) => (
                        <span className="text-[11px] text-slate-600">
                            {r.authorName ?? "—"}
                        </span>
                    ),
                    cellClassName: "px-2",
                },
                {
                    id: "categories",
                    header: "دسته‌بندی‌ها",
                    cell: (r) => (
                        <span className="text-[11px] text-slate-500">
                            {(Array.isArray(r.categories) ? r.categories : []).join("، ") || "—"}
                        </span>
                    ),
                    cellClassName: "px-2",
                },
                {
                    id: "publishedAt",
                    header: "تاریخ انتشار",
                    cell: (r) =>
                        r.publishedAtUtc
                            ? new Date(r.publishedAtUtc).toLocaleDateString("fa-IR")
                            : "—",
                    cellClassName: "px-2 text-[11px] text-slate-500",
                },
                {
                    id: "updatedAt",
                    header: "آخرین بروزرسانی",
                    cell: (r) =>
                        r.updatedAtUtc
                            ? new Date(r.updatedAtUtc).toLocaleDateString("fa-IR")
                            : "—",
                    cellClassName: "px-2 text-[11px] text-slate-400",
                },
                {
                    id: "status",
                    header: "وضعیت",
                    cell: (r) => (
                        <span className="text-[11px] text-slate-500">
                            {r.status === 1
                                ? "منتشر شده"
                                : r.status === 0
                                    ? "پیش‌نویس"
                                    : r.status === 2
                                        ? "لیست‌نشده"
                                        : "بایگانی شده"}
                        </span>
                    ),
                    cellClassName: "px-2",
                },
            ]}
        />
    );
}
