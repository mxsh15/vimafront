import { AdminListPage } from "@/shared/components/AdminListPage";
import { listAdminReturns } from "@/modules/admin-returns/api";
import type { AdminReturnListItemDto } from "@/modules/admin-returns/types";
import { ReturnRowMenuCell } from "@/modules/admin-returns/ui/ReturnRowMenuCell";

export const metadata = { title: "مرجوعی‌ها | پنل مدیریت" };

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
    searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
    const sp = await searchParams;
    const page = Number(sp?.page ?? 1);
    const q = sp?.q ?? "";
    const status = sp?.status as any;

    const data = await listAdminReturns({ page, pageSize: 20, q, status });

    return (
        <AdminListPage<AdminReturnListItemDto>
            title="مرجوعی‌ها"
            subtitle="مدیریت درخواست‌های مرجوعی کاربران"
            basePath="/admin/returns"
            data={data}
            q={q}
            createButton={
                <div className="flex items-center gap-2">
                    <a
                        href="/admin/returns/abandoned"
                        className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                        🕒 <span className="mr-1">رهاشده‌ها</span>
                    </a>
                </div>
            }
            showTrashButton
            trashHref="/admin/returns/trash"
            trashLabel="سطل زباله"
            searchPlaceholder="جستجو: ایمیل/نام/علت/شماره سفارش..."
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => <ReturnRowMenuCell row={row} />}
            columns={[
                { id: "order", header: "سفارش", cell: (r) => r.orderNumber, cellClassName: "px-2 text-xs font-mono" },
                { id: "customer", header: "مشتری", cell: (r) => r.customerName, cellClassName: "px-2 text-xs" },
                { id: "email", header: "ایمیل", cell: (r) => r.customerEmail, cellClassName: "px-2 text-xs font-mono" },
                { id: "reason", header: "علت", cell: (r) => r.reason, cellClassName: "px-2 text-xs max-w-[360px] truncate" },
                { id: "status", header: "وضعیت", cell: (r) => r.status, cellClassName: "px-2 text-xs" },
                { id: "req", header: "درخواست", cell: (r) => faDate(r.requestedAt), cellClassName: "px-2 text-xs" },
            ]}
        />
    );
}
