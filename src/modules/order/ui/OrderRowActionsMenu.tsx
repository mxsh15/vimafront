"use client";

import { useState, useTransition, FormEvent } from "react";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import { updateOrderStatusAction } from "../actions";
import type { OrderRow, OrderStatus } from "../types";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";

type Props = {
    order: Pick<OrderRow, "id" | "orderNumber" | "status" | "userFullName">;
};

const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: "Pending", label: "در انتظار" },
    { value: "Processing", label: "در حال پردازش" },
    { value: "Shipped", label: "ارسال شده" },
    { value: "Delivered", label: "تحویل شده" },
    { value: "Cancelled", label: "لغو شده" },
];

export function OrderRowActionsMenu({ order }: Props) {
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<OrderStatus>(typeof order.status === "string" ? (order.status as OrderStatus) : "Pending");
    const [pending, startTransition] = useTransition();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            await updateOrderStatusAction(order.id, status);
            setOpen(false);
        });
    };

    return (
        <>
            <RowActionsMenu
                onEdit={() => setOpen(true)}
                editLabel="تغییر وضعیت"
                onDelete={undefined}
                deleteLabel={""}
                extraActions={[{ label: "مشاهده جزئیات", onClick: () => { window.location.href = `/admin/orders/${order.id}`; } }]}
            />

            <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
                <DialogBackdrop className="fixed inset-0 bg-black/30" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg">
                        <DialogTitle className="mb-2 text-sm font-semibold">
                            تغییر وضعیت سفارش «{order.orderNumber}»
                        </DialogTitle>
                        <p className="mb-3 text-xs text-slate-600">
                            مشتری: {order.userFullName}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <label className="block text-xs font-medium text-slate-700">
                                وضعیت جدید
                            </label>
                            <select
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                            >
                                {statusOptions.map((x) => (
                                    <option key={x.value} value={x.value}>
                                        {x.label}
                                    </option>
                                ))}
                            </select>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs"
                                    onClick={() => setOpen(false)}
                                >
                                    انصراف
                                </button>
                                <button
                                    type="submit"
                                    disabled={pending}
                                    className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs text-white disabled:opacity-60"
                                >
                                    {pending ? "در حال ذخیره..." : "ثبت تغییر"}
                                </button>
                            </div>
                        </form>
                    </DialogPanel>
                </div>
            </Dialog>
        </>
    );
}
