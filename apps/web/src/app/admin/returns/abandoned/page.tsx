import { AdminListPage } from "@/shared/components/AdminListPage";
import { listAbandonedAdminReturns } from "@/modules/admin-returns/api";
import type { AdminReturnListItemDto } from "@/modules/admin-returns/types";
import { ReturnRowMenuCell } from "@/modules/admin-returns/ui/ReturnRowMenuCell";
import Link from "next/link";

export const metadata = { title: "مرجوعی‌های رهاشده | پنل مدیریت" };

function faDate(iso: string) {
    try {
        return new Date(iso).toLocaleDateString("fa-IR");
    } catch {
        return "-";
    }
}

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string; days?: string }>;
}) {
    const sp = await searchParams;
    const page = Number(sp?.page ?? 1);
    const q = sp?.q ?? "";
    const days = Number(sp?.days ?? 7);

    const data = await listAbandonedAdminReturns({ page, pageSize: 20, q, days });

    return (
        <AdminListPage<AdminReturnListItemDto>
            title="مرجوعی‌های رهاشده"
            subtitle={`درخواست‌های Pending که بیش از ${days} روز بررسی نشده‌اند`}
            basePath="/admin/returns/abandoned"
            data={data}
            q={q}
            createButton={
                <Link
                    href="/admin/returns"
                    className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                    ← بازگشت به لیست مرجوعی ها
                </Link>
            }
            showTrashButton
            trashHref="/admin/returns/trash"
            trashLabel="سطل زباله"
            searchPlaceholder="جستجو..."
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => <ReturnRowMenuCell row={row} />}
            columns={[
                { id: "order", header: "سفارش", cell: (r) => r.orderNumber, cellClassName: "px-2 text-xs font-mono" },
                { id: "customer", header: "مشتری", cell: (r) => r.customerName, cellClassName: "px-2 text-xs" },
                { id: "email", header: "ایمیل", cell: (r) => r.customerEmail, cellClassName: "px-2 text-xs font-mono" },
                { id: "reason", header: "علت", cell: (r) => r.reason, cellClassName: "px-2 text-xs max-w-[360px] truncate" },
                { id: "req", header: "درخواست", cell: (r) => faDate(r.requestedAt), cellClassName: "px-2 text-xs" },
            ]}
        />
    );
}
