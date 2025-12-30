import { AdminListPage } from "@/shared/components/AdminListPage";
import { listAbandonedPayouts } from "@/modules/admin-vendor-finance/api";
import type { AdminVendorPayoutListItemDto } from "@/modules/admin-vendor-finance/types";
import { PayoutRowMenuCell } from "@/modules/admin-vendor-finance/ui/PayoutRowMenuCell";

export const metadata = { title: "تسویه‌های رهاشده | پنل مدیریت" };

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; days?: string }> }) {
    const sp = await searchParams;
    const page = Number(sp?.page ?? 1);
    const q = sp?.q ?? "";
    const days = Number(sp?.days ?? 7);
    const pageSize = 20;

    const data = await listAbandonedPayouts({ page, pageSize, q, days });

    return (
        <AdminListPage<AdminVendorPayoutListItemDto>
            title="تسویه‌های رهاشده"
            subtitle={`درخواست‌های Pending قدیمی‌تر از ${days} روز`}
            basePath="/admin/vendor-finance/payouts/abandoned"
            data={data}
            q={q}
            createButton={null as any}
            showTrashButton
            trashHref="/admin/vendor-finance/payouts/trash"
            trashLabel="سطل زباله"
            searchPlaceholder="جستجو..."
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => <PayoutRowMenuCell row={row} />}
            columns={[
                { id: "store", header: "فروشگاه", cell: (r) => <span className="font-medium">{r.storeName}</span>, cellClassName: "px-2" },
                { id: "amount", header: "مبلغ", cell: (r) => Number(r.amount).toLocaleString("fa-IR"), cellClassName: "px-2 text-xs" },
                { id: "req", header: "درخواست", cell: (r) => new Date(r.requestedAt).toLocaleDateString("fa-IR"), cellClassName: "px-2 text-xs" },
            ]}
        />
    );
}
