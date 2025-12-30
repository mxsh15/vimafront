import { AdminListPage } from "@/shared/components/AdminListPage";
import { listCategories, listCategoryOptions } from "@/modules/category/api";
import { CategoryCreateButton } from "@/modules/category/ui/CategoryCreateButton";
import { CategoryRowActionsMenu } from "@/modules/category/ui/CategoryRowActionsMenu";
import {
  CategoryListItemDto,
  CategoryRowWithLevel,
} from "@/modules/category/types";

export const metadata = {
  title: "دسته‌بندی‌ها | پنل مدیریت",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; parentId?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const q = params.q ?? "";
  const pageSize = 20;

  const [data, parentOptions] = await Promise.all([
    listCategories({ page, pageSize, q }),
    listCategoryOptions({ onlyActive: true }),
  ]);

  const byId = new Map<string, CategoryListItemDto>();
  data.items.forEach((c) => byId.set(c.id, c));

  const getLevel = (cat: CategoryListItemDto): number => {
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

  const itemsWithLevel: CategoryRowWithLevel[] = data.items.map((c) => ({
    ...c,
    level: getLevel(c),
  }));

  const dataWithLevel = { ...data, items: itemsWithLevel };

  return (
    <AdminListPage<CategoryListItemDto>
      title="دسته‌بندی‌ها"
      subtitle="مدیریت و ویرایش دسته‌های محصولات فروشگاه"
      basePath="/admin/categories"
      data={dataWithLevel}
      q={q}
      createButton={<CategoryCreateButton parentOptions={parentOptions} />}
      searchPlaceholder="جستجوی دسته..."
      enableStatusFilter={false}
      totalLabel={`${data.totalCount} دسته ثبت شده`}
      emptyMessage="هیچ دسته‌ای ثبت نشده است."
      rowMenuHeader="عملیات"
      rowMenuCell={(row) => (
        <CategoryRowActionsMenu category={row} parentOptions={parentOptions} />
      )}
      showTrashButton={true}
      trashHref="/admin/categories/trash"
      trashLabel="سطل زباله"
      columns={[
        {
          id: "title",
          header: "نام",
          cell: (r) => (
            <div className="flex items-center">
              <span
                style={{ paddingRight: r.level * 16 }}
                className="flex items-center"
              >
                {r.level > 0 && (
                  <span className="ml-2 inline-block h-px w-4 bg-slate-300" />
                )}
                <span
                  className={
                    r.level === 0
                      ? "font-medium text-slate-900"
                      : "font-medium text-slate-700"
                  }
                >
                  {r.title}
                </span>
              </span>
            </div>
          ),
          cellClassName: "px-2",
        },
        {
          id: "slug",
          header: "نامک",
          cell: (r) => (
            <span className="font-mono text-xs text-slate-600">{r.slug}</span>
          ),
          cellClassName: "px-4",
        },
        {
          id: "sortOrder",
          header: "ترتیب",
          cell: (r) => (
            <span className="text-[11px] text-slate-400">{r.sortOrder}</span>
          ),
          cellClassName: "px-2",
        },
        {
          id: "status",
          header: "وضعیت",
          cell: (r) => (
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                r.isActive
                  ? "border-emerald-100 bg-emerald-50 text-emerald-500"
                  : "border-slate-200 bg-slate-50 text-slate-400"
              }`}
            >
              {r.isActive ? "فعال" : "غیرفعال"}
            </span>
          ),
          cellClassName: "px-2",
        },
      ]}
    />
  );
}
