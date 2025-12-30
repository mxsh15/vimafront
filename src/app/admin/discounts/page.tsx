import { listDiscounts } from "@/modules/discounts/api";
import { AdminListPage } from "@/shared/components/AdminListPage";
import type { DiscountListItemDto } from "@/modules/discounts/types";
import { DiscountCreateButton } from "@/modules/discounts/ui/DiscountCreateButton";
import { DiscountRowMenuCell } from "@/modules/discounts/ui/DiscountRowMenuCell";

export const metadata = { title: "تخفیف‌ها | پنل مدیریت" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params?.page ?? 1);
  const q = params?.q ?? "";

  const data = await listDiscounts({ page, pageSize: 20, q });

  return (
    <AdminListPage<DiscountListItemDto>
      title="تخفیف‌ها"
      subtitle="مدیریت تخفیف‌های سیستم"
      basePath="/admin/discounts"
      data={data}
      q={q}
      createButton={<DiscountCreateButton />}
      showTrashButton={true}
      trashHref="/admin/discounts/trash"
      trashLabel="سطل زباله تخفیف‌ها"
      searchPlaceholder="جستجوی تخفیف..."
      rowMenuHeader="عملیات"
      rowMenuCell={(row) => <DiscountRowMenuCell row={row} />}
      columns={[
        { id: "title", header: "عنوان", cell: (r) => r.title, cellClassName: "px-2 text-xs" },
        {
          id: "scope",
          header: "محدوده",
          cell: (r) => (r.productId ? "محصول" : r.categoryId ? "دسته" : r.vendorId ? "فروشنده" : r.brandId ? "برند" : "عمومی"),
          cellClassName: "px-2 text-xs text-slate-600",
        },
        {
          id: "value",
          header: "مقدار",
          cell: (r) => (r.type === 0 ? `${r.value}% تخفیف` : `${Number(r.value).toLocaleString("fa-IR")} تومان`),
          cellClassName: "px-2 text-xs",
        },
      ]}
    />
  );
}
