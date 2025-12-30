"use client";

import { AdminListPage } from "@/shared/components/AdminListPage";
import type { PagedResult } from "@/shared/types/adminlistpageTypes";
import { PermissionGuard } from "@/shared/components/PermissionGuard";
import { usePermissions } from "@/context/PermissionContext";
import { OrderRow } from "@/modules/order/types";
import { OrderRowActionsMenu } from "@/modules/order/ui/OrderRowActionsMenu";

type Props = {
    data: PagedResult<OrderRow>;
    q: string;
};

function statusLabel(status: OrderRow["status"]) {
    console.log(status);
    switch (status) {
        case 0:
            return { text: "در انتظار", cls: "border-amber-200 bg-amber-50 text-amber-600" };
        case 2:
            return { text: "در حال پردازش", cls: "border-blue-200 bg-blue-50 text-blue-600" };
        case 3:
            return { text: "ارسال شده", cls: "border-indigo-200 bg-indigo-50 text-indigo-600" };
        case 4:
            return { text: "تحویل شده", cls: "border-emerald-200 bg-emerald-50 text-emerald-600" };
        case 5:
            return { text: "لغو شده", cls: "border-rose-200 bg-rose-50 text-rose-600" };
        default:
            return { text: String(status), cls: "border-slate-200 bg-slate-50 text-slate-600" };
    }
}

export function OrdersPageClient({ data, q }: Props) {
    const { hasPermission } = usePermissions();

    return (
        <AdminListPage<OrderRow>
            title="سفارش‌ها"
            subtitle="مدیریت سفارش‌های ثبت شده در فروشگاه"
            basePath="/admin/orders"
            data={data}
            q={q}
            createButton={null}
            emptyMessage="سفارشی ثبت نشده است."
            rowMenuHeader="عملیات"
            rowMenuCell={(row) =>
                hasPermission("orders.update") ? (
                    <PermissionGuard permission="orders.update">
                        <OrderRowActionsMenu order={row} />
                    </PermissionGuard>
                ) : hasPermission("orders.view") ? (
                    <PermissionGuard permission="orders.view">
                        <OrderRowActionsMenu order={row} />
                    </PermissionGuard>
                ) : null
            }
            showTrashButton={false}
            columns={[
                {
                    id: "orderNumber",
                    header: "شماره سفارش",
                    cell: (r) => r.orderNumber,
                    cellClassName: "px-2 text-xs font-mono",
                },
                {
                    id: "customer",
                    header: "مشتری",
                    cell: (r) => r.userFullName,
                    cellClassName: "px-2 text-xs",
                },
                {
                    id: "itemsCount",
                    header: "تعداد آیتم",
                    cell: (r) => r.itemsCount,
                    cellClassName: "px-2 text-center text-xs",
                },
                {
                    id: "total",
                    header: "مبلغ",
                    cell: (r) => `${Number(r.totalAmount ?? 0).toLocaleString("fa-IR")} تومان`,
                    cellClassName: "px-2 text-xs",
                },
                {
                    id: "status",
                    header: "وضعیت",
                    cell: (r) => {
                        const s = statusLabel(r.status);
                        return (
                            <span className={"inline-flex rounded-full border px-2 py-0.5 text-[10px] " + s.cls}>
                                {s.text}
                            </span>
                        );
                    },
                    cellClassName: "px-2",
                },
                {
                    id: "createdAt",
                    header: "تاریخ",
                    cell: (r) =>
                        new Date(r.createdAtUtc).toLocaleString("fa-IR", {
                            dateStyle: "short",
                            timeStyle: "short",
                        }),
                    cellClassName: "px-2 text-[11px] text-slate-400",
                },
            ]}
        />
    );
}
