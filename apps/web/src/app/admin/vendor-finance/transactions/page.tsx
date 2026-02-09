import { AdminListPage } from "@/shared/components/AdminListPage";
import { listTransactions } from "@/modules/admin-vendor-finance/api";
import type { AdminVendorTransactionListItemDto } from "@/modules/admin-vendor-finance/types";

export const metadata = { title: "تراکنش‌های فروشندگان | پنل مدیریت" };

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; vendorId?: string; type?: string }> }) {
    const sp = await searchParams;
    const page = Number(sp?.page ?? 1);
    const q = sp?.q ?? "";
    const vendorId = sp?.vendorId;
    const type = sp?.type;
    const pageSize = 20;

    const data = await listTransactions({ page, pageSize, q, vendorId, type });

    return (
        <AdminListPage<AdminVendorTransactionListItemDto>
            title="تراکنش‌های فروشندگان"
            subtitle="گزارش تراکنش‌های مالی"
            basePath="/admin/vendor-finance/transactions"
            data={data}
            q={q}
            createButton={null as any}
            searchPlaceholder="جستجو: فروشگاه/شرح/Ref/OrderId..."
            rowMenuHeader=""
            rowMenuCell={() => null}
            columns={[
                { id: "store", header: "فروشگاه", cell: (r) => <span className="font-medium">{r.storeName}</span>, cellClassName: "px-2" },
                { id: "type", header: "نوع", cell: (r) => r.type, cellClassName: "px-2 text-xs" },
                { id: "amount", header: "مبلغ", cell: (r) => Number(r.amount).toLocaleString("fa-IR"), cellClassName: "px-2 text-xs" },
                { id: "after", header: "مانده", cell: (r) => Number(r.balanceAfter).toLocaleString("fa-IR"), cellClassName: "px-2 text-xs" },
                { id: "order", header: "OrderId", cell: (r) => <span className="font-mono text-[11px]">{r.orderId ?? "-"}</span>, cellClassName: "px-2" },
                { id: "ref", header: "Ref", cell: (r) => <span className="font-mono text-[11px]">{r.referenceNumber ?? "-"}</span>, cellClassName: "px-2" },
            ]}
        />
    );
}
