import { AdminListPage } from "@/shared/components/AdminListPage";
import { listDeletedAdminReturns } from "@/modules/admin-returns/api";
import type { AdminReturnListItemDto } from "@/modules/admin-returns/types";
import { ReturnTrashRowMenuCell } from "@/modules/admin-returns/ui/ReturnTrashRowMenuCell";
import Link from "next/link";

export const metadata = { title: "سطل زباله مرجوعی‌ها | پنل مدیریت" };

function faDate(iso?: string | null) {
    if (!iso) return "-";
    try {
        return new Date(iso).toLocaleDateString("fa-IR");
    } catch {
        return "-";
    }
}

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string }>;
}) {
    const sp = await searchParams;
    const page = Number(sp?.page ?? 1);
    const q = sp?.q ?? "";

    const data = await listDeletedAdminReturns({ page, pageSize: 20, q });

    return (
        <AdminListPage<AdminReturnListItemDto>
            title="سطل زباله مرجوعی‌ها"
            subtitle="بازیابی یا حذف دائمی"
            basePath="/admin/returns/trash"
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
            showTrashButton={false}
            searchPlaceholder="جستجو..."
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => <ReturnTrashRowMenuCell row={row} />}
            columns={[
                { id: "order", header: "سفارش", cell: (r) => r.orderNumber, cellClassName: "px-2 text-xs font-mono" },
                { id: "customer", header: "مشتری", cell: (r) => r.customerName, cellClassName: "px-2 text-xs" },
                { id: "email", header: "ایمیل", cell: (r) => r.customerEmail, cellClassName: "px-2 text-xs font-mono" },
                { id: "deleted", header: "حذف شده در", cell: (r) => faDate(r.deletedAtUtc), cellClassName: "px-2 text-xs" },
            ]}
        />
    );
}
