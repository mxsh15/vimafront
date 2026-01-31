import { Suspense } from "react";
import { AdminListPage } from "@/shared/components/AdminListPage";
import { listAdminVendorOffers } from "@/modules/admin-vendor-offers/api";
import { OfferRowMenuCell } from "@/modules/admin-vendor-offers/ui/OfferRowMenuCell";
import type { AdminVendorOfferListItemDto, VendorOfferStatus } from "@/modules/admin-vendor-offers/types";

export const metadata = { title: "پیشنهادهای فروشندگان | پنل مدیریت" };

export default function Page({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; status?: string };
}) {
  return (
    <Suspense fallback={<div className="p-4 text-sm">در حال بارگذاری…</div>}>
      <OffersList searchParams={searchParams} />
    </Suspense>
  );
}

async function OffersList({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; status?: string };
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const q = params.q ?? "";
  const status = (params.status as VendorOfferStatus | undefined) || undefined;
  const data = await listAdminVendorOffers({ page, pageSize: 20, q, status });

  return (
    <AdminListPage<AdminVendorOfferListItemDto>
      title="Offer Moderation"
      subtitle="بررسی و تایید/رد پیشنهادهای فروشندگان"
      basePath="/admin/vendor-offers"
      data={data}
      q={q}
      createButton={
        <div className="flex items-center gap-2">
          <a
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px]"
            href="/admin/vendor-offers/price-discrepancies"
          >
            📊 اختلاف قیمت‌ها
          </a>
          <a
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px]"
            href="/admin/vendor-offers?status=Pending"
          >
            ⏳ Pending
          </a>
          <a
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px]"
            href="/admin/vendor-offers?status=Approved"
          >
            ✅ Approved
          </a>
        </div>
      }
      showTrashButton
      trashHref="/admin/vendor-offers/trash"
      trashLabel="سطل زباله"
      searchPlaceholder="جستجو: محصول / فروشگاه ..."
      rowMenuHeader="عملیات"
      rowMenuCell={(row) => <OfferRowMenuCell row={row} />}
      columns={[
        { id: "product", header: "محصول", cell: (r) => r.productTitle, cellClassName: "px-2 text-xs" },
        { id: "vendor", header: "فروشنده", cell: (r) => r.vendorName, cellClassName: "px-2 text-xs" },
        { id: "price", header: "قیمت", cell: (r) => Number(r.price).toLocaleString("fa-IR"), cellClassName: "px-2 text-xs" },
        { id: "discount", header: "قیمت تخفیف", cell: (r) => (r.discountPrice ? Number(r.discountPrice).toLocaleString("fa-IR") : "-"), cellClassName: "px-2 text-xs" },
        { id: "status", header: "وضعیت", cell: (r) => r.status, cellClassName: "px-2 text-xs" },
      ]}
    />
  );
}
