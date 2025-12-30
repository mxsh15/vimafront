import { AdminListPage } from "@/shared/components/AdminListPage";
import { listPayouts } from "@/modules/admin-vendor-finance/api";
import type { AdminVendorPayoutListItemDto } from "@/modules/admin-vendor-finance/types";
import { PayoutRowMenuCell } from "@/modules/admin-vendor-finance/ui/PayoutRowMenuCell";

export const metadata = { title: "تسویه‌های فروشندگان | پنل مدیریت" };

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; status?: string }> }) {
    const sp = await searchParams;
    const page = Number(sp?.page ?? 1);
    const q = sp?.q ?? "";
    const status = sp?.status;
    const pageSize = 20;

    const data = await listPayouts({ page, pageSize, q, status });

    return (
        <AdminListPage<AdminVendorPayoutListItemDto>
            title="تسویه‌های فروشندگان"
            subtitle="درخواست‌های برداشت/تسویه"
            basePath="/admin/vendor-finance/payouts"
            data={data}
            q={q}
            createButton={
                <div className="flex items-center gap-2">
                    <a
                        href="/admin/vendor-finance/payouts/abandoned"
                        className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                        🕒 <span className="mr-1">رهاشده‌ها</span>
                    </a>
                </div>
            }
            showTrashButton
            trashHref="/admin/vendor-finance/payouts/trash"
            trashLabel="سطل زباله"
            searchPlaceholder="جستجو: فروشگاه/شبا/حساب..."
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => <PayoutRowMenuCell row={row} />}
            columns={[
                { id: "store", header: "فروشگاه", cell: (r) => <span className="font-medium">{r.storeName}</span>, cellClassName: "px-2" },
                { id: "amount", header: "مبلغ", cell: (r) => Number(r.amount).toLocaleString("fa-IR"), cellClassName: "px-2 text-xs" },
                { id: "status", header: "وضعیت", cell: (r) => r.status, cellClassName: "px-2 text-xs" },
                { id: "req", header: "درخواست", cell: (r) => new Date(r.requestedAt).toLocaleDateString("fa-IR"), cellClassName: "px-2 text-xs" },
            ]}
        />
    );
}
