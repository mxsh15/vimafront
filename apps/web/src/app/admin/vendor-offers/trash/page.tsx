import { AdminListPage } from "@/shared/components/AdminListPage";
import { listAdminVendorOffersTrash } from "@/modules/admin-vendor-offers/api";
import type { AdminVendorOfferListItemDto } from "@/modules/admin-vendor-offers/types";
import { OfferTrashRowMenuCell } from "@/modules/admin-vendor-offers/ui/OfferTrashRowMenuCell";

export const metadata = { title: "سطل زباله پیشنهادها | پنل مدیریت" };

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
    const sp = await searchParams;
    const page = Number(sp?.page ?? 1);
    const q = sp?.q ?? "";

    const data = await listAdminVendorOffersTrash({ page, pageSize: 20, q });

    return (
        <AdminListPage<AdminVendorOfferListItemDto>
            title="سطل زباله پیشنهادها"
            subtitle="بازیابی یا حذف دائمی"
            basePath="/admin/vendor-offers/trash"
            data={data}
            q={q}
            createButton={null as any}
            showTrashButton={false}
            searchPlaceholder="جستجو..."
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => <OfferTrashRowMenuCell row={row} />}
            columns={[
                { id: "product", header: "محصول", cell: (r) => r.productTitle, cellClassName: "px-2 text-xs" },
                { id: "vendor", header: "فروشنده", cell: (r) => r.vendorName, cellClassName: "px-2 text-xs" },
                { id: "deleted", header: "حذف شده", cell: (r) => (r.deletedAtUtc ? new Date(r.deletedAtUtc).toLocaleDateString("fa-IR") : "-"), cellClassName: "px-2 text-xs" },
            ]}
        />
    );
}
