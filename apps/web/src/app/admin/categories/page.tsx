import { listCategories, listCategoryOptions } from "@/modules/category/api";
import { CategoriesPageClient } from "./CategoriesPageClient";

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

  return (
    <CategoriesPageClient
      data={data}
      q={q}
      page={page}
      pageSize={pageSize}
      parentOptions={parentOptions}
    />
  );
}
