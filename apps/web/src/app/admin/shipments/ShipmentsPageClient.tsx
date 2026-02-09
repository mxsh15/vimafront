"use client";

import { AdminListPage } from "@/shared/components/AdminListPage";
import type { PagedResult } from "@/shared/types/adminlistpageTypes";
import type { ShipmentRow } from "@/modules/shipments/types";
import { PermissionGuard } from "@/shared/components/PermissionGuard";
import { usePermissions } from "@/context/PermissionContext";
import { ShipmentRowActionsMenu } from "@/modules/shipments/ui/ShipmentRowActionsMenu";

type Props = { data: PagedResult<ShipmentRow>; q: string };

function badge(status: ShipmentRow["status"]) {
    const base = "inline-flex rounded-full border px-2 py-0.5 text-[10px] ";
    switch (status) {
        case "Delivered":
            return <span className={base + "border-emerald-200 bg-emerald-50 text-emerald-600"}>تحویل شده</span>;
        case "Shipped":
            return <span className={base + "border-indigo-200 bg-indigo-50 text-indigo-600"}>ارسال شده</span>;
        case "Pending":
            return <span className={base + "border-amber-200 bg-amber-50 text-amber-600"}>در انتظار</span>;
        case "Cancelled":
            return <span className={base + "border-rose-200 bg-rose-50 text-rose-600"}>لغو</span>;
        default:
            return <span className={base + "border-slate-200 bg-slate-50 text-slate-600"}>{status}</span>;
    }
}

export function ShipmentsPageClient({ data, q }: Props) {
    const { hasPermission } = usePermissions();

    return (
        <AdminListPage<ShipmentRow>
            title="مرسوله‌ها"
            subtitle="مدیریت ارسال سفارش‌ها، شماره پیگیری و وضعیت تحویل"
            basePath="/admin/shipments"
            data={data}
            q={q}
            createButton={null}
            emptyMessage="مرسوله‌ای ثبت نشده است."
            rowMenuHeader="عملیات"
            rowMenuCell={(row) =>
                hasPermission("shipments.manage") ? (
                    <PermissionGuard permission="shipments.manage">
                        <ShipmentRowActionsMenu shipment={row} />
                    </PermissionGuard>
                ) : null
            }
            showTrashButton={false}
            columns={[
                { id: "order", header: "سفارش", cell: (r) => r.orderNumber, cellClassName: "px-2 text-xs font-mono" },
                { id: "customer", header: "مشتری", cell: (r) => r.customerName, cellClassName: "px-2 text-xs" },
                { id: "city", header: "شهر", cell: (r) => `${r.province} - ${r.city}`, cellClassName: "px-2 text-xs text-slate-700" },
                { id: "tracking", header: "کد رهگیری", cell: (r) => r.trackingNumber ?? "-", cellClassName: "px-2 text-xs font-mono" },
                { id: "status", header: "وضعیت", cell: (r) => badge(r.status), cellClassName: "px-2" },
                {
                    id: "createdAt",
                    header: "ایجاد",
                    cell: (r) =>
                        new Date(r.createdAtUtc).toLocaleString("fa-IR", { dateStyle: "short", timeStyle: "short" }),
                    cellClassName: "px-2 text-[11px] text-slate-400",
                },
            ]}
        />
    );
}
