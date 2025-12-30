import { AdminListPage } from "@/shared/components/AdminListPage";
import { listWallets } from "@/modules/admin-vendor-finance/api";
import type { AdminVendorWalletListItemDto } from "@/modules/admin-vendor-finance/types";
import Link from "next/link";

export const metadata = { title: "کیف پول فروشندگان | پنل مدیریت" };

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
    const sp = await searchParams;
    const page = Number(sp?.page ?? 1);
    const q = sp?.q ?? "";
    const pageSize = 20;

    const data = await listWallets({ page, pageSize, q });

    return (
        <AdminListPage<AdminVendorWalletListItemDto>
            title="کیف پول فروشندگان"
            subtitle="موجودی و وضعیت مالی فروشندگان"
            basePath="/admin/vendor-finance/wallets"
            data={data}
            q={q}
            createButton={null as any}
            searchPlaceholder="جستجو: نام فروشگاه یا VendorId..."
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => (
                <Link
                    href={`/admin/vendor-finance/wallets/${row.vendorId}`}
                    className="rounded-xl border border-slate-200 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
                >
                    جزئیات
                </Link>
            )}
            columns={[
                { id: "store", header: "فروشگاه", cell: (r) => <span className="font-medium">{r.storeName}</span>, cellClassName: "px-2" },
                { id: "balance", header: "قابل برداشت", cell: (r) => r.balance.toLocaleString("fa-IR"), cellClassName: "px-2 text-xs" },
                { id: "pending", header: "در انتظار", cell: (r) => r.pendingBalance.toLocaleString("fa-IR"), cellClassName: "px-2 text-xs" },
                { id: "earn", header: "کل درآمد", cell: (r) => r.totalEarnings.toLocaleString("fa-IR"), cellClassName: "px-2 text-xs" },
                { id: "wd", header: "کل برداشت", cell: (r) => r.totalWithdrawn.toLocaleString("fa-IR"), cellClassName: "px-2 text-xs" },
            ]}
        />
    );
}
