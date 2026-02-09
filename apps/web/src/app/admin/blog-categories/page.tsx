import {
    listBlogCategoriesPaged,
    listBlogCategoriesOptions,
} from "@/modules/blog-taxonomy/api";
import type {
    BlogCategoryListDto,
    BlogCategoryRowWithLevel,
} from "@/modules/blog-taxonomy/types";
import { AdminListPage } from "@/shared/components/AdminListPage";
import { BlogCategoryModalButton } from "@/modules/blog-taxonomy/ui/BlogCategoryModalButton";
import { BlogCategoryRowActionsMenu } from "@/modules/blog-taxonomy/ui/BlogCategoryRowActionsMenu";

export const metadata = {
    title: "دسته‌بندی‌های بلاگ | پنل مدیریت",
};

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string }>;
}) {
    const params = await searchParams;
    const page = Number(params?.page ?? 1);
    const q = params?.q ?? "";

    const [data, categoryOptions] = await Promise.all([
        listBlogCategoriesPaged({ page, pageSize: 10, q }),
        listBlogCategoriesOptions(),
    ]);

    // --- محاسبه level مثل دسته‌بندی محصولات ---
    const byId = new Map<string, BlogCategoryListDto>();
    data.items.forEach((c: BlogCategoryListDto) => byId.set(c.id, c));

    const getLevel = (cat: BlogCategoryListDto): number => {
        let level = 0;
        let current = cat;
        const visited = new Set<string>();

        while (current.parentId) {
            if (visited.has(current.id)) break;
            visited.add(current.id);

            const parent = byId.get(current.parentId);
            if (!parent) break;

            level++;
            current = parent;
        }
        return level;
    };

    const itemsWithLevel: BlogCategoryRowWithLevel[] = data.items.map((c: BlogCategoryListDto) => ({
        ...c,
        level: getLevel(c),
    }));

    const dataWithLevel = { ...data, items: itemsWithLevel };

    return (
        <AdminListPage<BlogCategoryListDto>
            title="دسته‌بندی‌های بلاگ"
            subtitle="مدیریت دسته‌های مقالات بلاگ"
            basePath="/admin/blog-categories"
            data={dataWithLevel}
            q={q}
            searchPlaceholder="جستجوی دسته‌بندی..."
            createButton={<BlogCategoryModalButton allCategories={categoryOptions} />}
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => (
                <BlogCategoryRowActionsMenu row={row} allCategories={categoryOptions} />
            )}
            showTrashButton={true}
            trashHref="/admin/blog-categories/trash"
            trashLabel="سطل زباله"
            columns={[
                {
                    id: "name",
                    header: "نام",
                    cell: (r) => {
                        const rr = r as BlogCategoryRowWithLevel;

                        return (
                            <div className="flex items-center">
                                <span
                                    style={{ paddingRight: rr.level * 16 }}
                                    className="flex items-center"
                                >
                                    {rr.level > 0 && (
                                        <span className="ml-2 inline-block h-px w-4 bg-slate-300" />
                                    )}

                                    <span
                                        className={
                                            rr.level === 0
                                                ? "font-medium text-slate-900"
                                                : "font-medium text-slate-700"
                                        }
                                    >
                                        {rr.name}
                                    </span>
                                </span>
                            </div>
                        );
                    },
                    cellClassName: "px-2 text-xs",
                },
                {
                    id: "slug",
                    header: "Slug",
                    cell: (r) => r.slug,
                    cellClassName: "px-2 text-[11px] ltr text-slate-500",
                },
                {
                    id: "parent",
                    header: "دسته والد",
                    cell: (r) => r.parentName ?? "—",
                    cellClassName: "px-2 text-[11px] text-slate-500",
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
