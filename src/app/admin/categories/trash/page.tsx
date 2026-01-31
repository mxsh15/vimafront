import { listDeletedCategories } from "@/modules/category/api";
import { CategoriesTrashPageClient } from "./CategoriesTrashPageClient";

export const metadata = {
  title: "سطل زباله دسته‌بندی‌ها | پنل مدیریت",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const q = params.q ?? "";
  const pageSize = 20;

  const data = await listDeletedCategories({ page, pageSize, q });

  return (
    <CategoriesTrashPageClient data={data} q={q} page={page} pageSize={pageSize} />
  );
}
