import { listCoupons } from "@/modules/coupons/api";
import { AdminListPage } from "@/shared/components/AdminListPage";
import type { CouponListItemDto } from "@/modules/coupons/types";
import { CouponCreateButton } from "@/modules/coupons/ui/CouponCreateButton";
import { CouponRowMenuCell } from "@/modules/coupons/ui/CouponRowMenuCell";

export const metadata = { title: "کوپن‌ها | پنل مدیریت" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params?.page ?? 1);
  const q = params?.q ?? "";

  const data = await listCoupons({ page, pageSize: 20, q });

  return (
    <AdminListPage<CouponListItemDto>
      title="کوپن‌ها"
      subtitle="مدیریت کوپن‌های تخفیف"
      basePath="/admin/coupons"
      data={data}
      q={q}
      createButton={<CouponCreateButton />}
      showTrashButton={true}
      trashHref="/admin/coupons/trash"
      trashLabel="سطل زباله کوپن‌ها"
      searchPlaceholder="جستجوی کوپن..."
      rowMenuHeader="عملیات"
      rowMenuCell={(row) => <CouponRowMenuCell row={row} />}
      columns={[
        { id: "code", header: "کد", cell: (r) => r.code, cellClassName: "px-2 text-xs font-mono" },
        { id: "title", header: "عنوان", cell: (r) => r.title, cellClassName: "px-2 text-xs" },
        {
          id: "value",
          header: "مقدار",
          cell: (r) => (r.type === 0 ? `${r.value}% تخفیف` : `${Number(r.value).toLocaleString("fa-IR")} تومان`),
          cellClassName: "px-2 text-xs",
        },
        { id: "used", header: "استفاده", cell: (r) => `${r.usedCount}/${r.maxUsageCount ?? "∞"}`, cellClassName: "px-2 text-xs" },
      ]}
    />
  );
}
