"use client";

import { AdminListPage } from "@/shared/components/AdminListPage";
import type { PagedResult } from "@/shared/types/adminlistpageTypes";
import type { PaymentRow } from "@/modules/payments/types";
import { PermissionGuard } from "@/shared/components/PermissionGuard";
import { usePermissions } from "@/context/PermissionContext";
import Link from "next/link";

type Props = { data: PagedResult<PaymentRow>; q: string };

function badge(status: PaymentRow["status"]) {
    const base = "inline-flex rounded-full border px-2 py-0.5 text-[10px] ";
    switch (status) {
        case 2:
            return <span className={base + "border-emerald-200 bg-emerald-50 text-emerald-600"}>موفق</span>;
        case 0:
            return <span className={base + "border-amber-200 bg-amber-50 text-amber-600"}>در انتظار</span>;
        case 3:
            return <span className={base + "border-rose-200 bg-rose-50 text-rose-600"}>ناموفق</span>;
        case 4:
            return <span className={base + "border-slate-200 bg-slate-50 text-slate-600"}>لغو</span>;
        default:
            return <span className={base + "border-slate-200 bg-slate-50 text-slate-600"}>{status}</span>;
    }
}

export function PaymentsPageClient({ data, q }: Props) {
    const { hasPermission } = usePermissions();

    return (
        <AdminListPage<PaymentRow>
            title="پرداخت‌ها"
            subtitle="لیست پرداخت‌ها و وضعیت تراکنش‌ها"
            basePath="/admin/payments"
            data={data}
            q={q}
            createButton={null}
            emptyMessage="پرداختی ثبت نشده است."
            rowMenuHeader="سفارش"
            rowMenuCell={(row) =>
                hasPermission("orders.view") ? (
                    <PermissionGuard permission="orders.view">
                        <Link className="text-xs text-sky-600 hover:underline" href={`/admin/orders/${row.orderId}`}>
                            مشاهده سفارش
                        </Link>
                    </PermissionGuard>
                ) : null
            }
            showTrashButton={false}
            columns={[
                { id: "orderNumber", header: "سفارش", cell: (r) => r.orderNumber, cellClassName: "px-2 text-xs font-mono" },
                { id: "customer", header: "مشتری", cell: (r) => r.customerName, cellClassName: "px-2 text-xs" },
                { id: "txn", header: "Transaction", cell: (r) => r.transactionId, cellClassName: "px-2 text-xs font-mono" },
                { id: "ref", header: "Reference", cell: (r) => r.referenceNumber ?? "-", cellClassName: "px-2 text-xs font-mono text-slate-600" },
                { id: "amount", header: "مبلغ", cell: (r) => `${Number(r.amount ?? 0).toLocaleString("fa-IR")} تومان`, cellClassName: "px-2 text-xs" },
                { id: "status", header: "وضعیت", cell: (r) => badge(r.status), cellClassName: "px-2" },
                {
                    id: "createdAt",
                    header: "تاریخ",
                    cell: (r) => new Date(r.createdAtUtc).toLocaleString("fa-IR", { dateStyle: "short", timeStyle: "short" }),
                    cellClassName: "px-2 text-[11px] text-slate-400",
                },
            ]}
        />
    );
}
