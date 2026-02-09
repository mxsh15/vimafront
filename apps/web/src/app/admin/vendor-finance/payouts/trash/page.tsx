import { AdminListPage } from "@/shared/components/AdminListPage";
import { listPayoutTrash } from "@/modules/admin-vendor-finance/api";
import type { AdminVendorPayoutListItemDto } from "@/modules/admin-vendor-finance/types";
import { PayoutTrashRowMenuCell } from "@/modules/admin-vendor-finance/ui/PayoutTrashRowMenuCell";

export const metadata = { title: "سطل زباله تسویه‌ها | پنل مدیریت" };

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
    const sp = await searchParams;
    const page = Number(sp?.page ?? 1);
    const q = sp?.q ?? "";
    const pageSize = 20;

    const data = await listPayoutTrash({ page, pageSize, q });

    return (
        <AdminListPage<AdminVendorPayoutListItemDto>
            title="سطل زباله تسویه‌ها"
            subtitle="بازیابی یا حذف دائمی"
            basePath="/admin/vendor-finance/payouts/trash"
            data={data}
            q={q}
            createButton={null as any}
            showTrashButton={false}
            searchPlaceholder="جستجو..."
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => <PayoutTrashRowMenuCell row={row} />}
            columns={[
                { id: "store", header: "فروشگاه", cell: (r) => <span className="font-medium">{r.storeName}</span>, cellClassName: "px-2" },
                { id: "amount", header: "مبلغ", cell: (r) => Number(r.amount).toLocaleString("fa-IR"), cellClassName: "px-2 text-xs" },
                { id: "deleted", header: "حذف شده", cell: (r) => (r.deletedAtUtc ? new Date(r.deletedAtUtc).toLocaleDateString("fa-IR") : "-"), cellClassName: "px-2 text-xs" },
            ]}
        />
    );
}
