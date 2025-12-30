import { listBlogTagsPaged } from "@/modules/blog-taxonomy/api";
import type { BlogTagListDto } from "@/modules/blog-taxonomy/types";
import { AdminListPage } from "@/shared/components/AdminListPage";
import { BlogTagModalButton } from "@/modules/blog-taxonomy/ui/BlogTagModalButton";
import { BlogTagRowActionsMenu } from "@/modules/blog-taxonomy/ui/BlogTagRowActionsMenu";

export const metadata = {
    title: "برچسب‌های بلاگ | پنل مدیریت",
};

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string }>;
}) {
    const params = await searchParams;
    const page = Number(params?.page ?? 1);
    const q = params?.q ?? "";

    const data = await listBlogTagsPaged({ page, pageSize: 50, q });

    return (
        <AdminListPage<BlogTagListDto>
            title="برچسب‌های بلاگ"
            subtitle="مدیریت برچسب‌های مقالات"
            basePath="/admin/blog-tags"
            data={data}
            q={q}
            searchPlaceholder="جستجوی برچسب..."
            createButton={<BlogTagModalButton />}
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => <BlogTagRowActionsMenu row={row} />}
            showTrashButton={true}
            trashHref="/admin/blog-tags/trash"
            trashLabel="سطل زباله"
            columns={[
                {
                    id: "name",
                    header: "نام برچسب",
                    cell: (r) => r.name,
                    cellClassName: "px-2 text-xs",
                },
                {
                    id: "slug",
                    header: "Slug",
                    cell: (r) => r.slug,
                    cellClassName: "px-2 text-[11px] ltr text-slate-500",
                },
                {
                    id: "createdAt",
                    header: "تاریخ ایجاد",
                    cell: (r) =>
                        new Date(r.createdAtUtc).toLocaleDateString("fa-IR"),
                    cellClassName: "px-2 text-[11px] text-slate-400",
                },
            ]}
        />
    );
}
