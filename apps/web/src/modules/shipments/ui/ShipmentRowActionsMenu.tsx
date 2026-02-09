"use client";

import { useMemo, useState, useTransition, FormEvent } from "react";
import Link from "next/link";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import { upsertShipmentByOrderAction } from "../actions";
import type { ShipmentRow, ShippingStatus, ShippingUpsertDto } from "../types";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";

type Props = { shipment: ShipmentRow };

const statusOptions: { value: ShippingStatus; label: string }[] = [
    { value: "Pending", label: "در انتظار" },
    { value: "Shipped", label: "ارسال شده" },
    { value: "Delivered", label: "تحویل شده" },
    { value: "Cancelled", label: "لغو شده" },
];

function toInputDateTime(value?: string | null) {
    if (!value) return "";
    const d = new Date(value);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromInputDateTime(value: string) {
    if (!value.trim()) return null;
    // datetime-local => local time. برای ذخیره UTC، ISO تولید می‌کنیم:
    return new Date(value).toISOString();
}

export function ShipmentRowActionsMenu({ shipment }: Props) {
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();

    const [status, setStatus] = useState<ShippingStatus>(shipment.status);
    const [trackingNumber, setTrackingNumber] = useState(shipment.trackingNumber ?? "");
    const [shippingCompany, setShippingCompany] = useState(shipment.shippingCompany ?? "");
    const [shippingMethod, setShippingMethod] = useState(shipment.shippingMethod ?? "");

    const [shippedAt, setShippedAt] = useState(toInputDateTime(shipment.shippedAt));
    const [deliveredAt, setDeliveredAt] = useState(toInputDateTime(shipment.deliveredAt));
    const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState(toInputDateTime(shipment.estimatedDeliveryDate));

    const dto: ShippingUpsertDto = useMemo(() => ({
        status,
        trackingNumber: trackingNumber.trim() || null,
        shippingCompany: shippingCompany.trim() || null,
        shippingMethod: shippingMethod.trim() || null,
        shippedAt: shippedAt ? fromInputDateTime(shippedAt) : null,
        deliveredAt: deliveredAt ? fromInputDateTime(deliveredAt) : null,
        estimatedDeliveryDate: estimatedDeliveryDate ? fromInputDateTime(estimatedDeliveryDate) : null,
    }), [status, trackingNumber, shippingCompany, shippingMethod, shippedAt, deliveredAt, estimatedDeliveryDate]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            await upsertShipmentByOrderAction(shipment.orderId, dto);
            setOpen(false);
        });
    };

    return (
        <>
            <RowActionsMenu
                onEdit={() => setOpen(true)}
                onDelete={undefined}
                editLabel="ویرایش مرسوله"
                deleteLabel={null as any}
            />

            <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
                <DialogBackdrop className="fixed inset-0 bg-black/30" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-lg">
                        <DialogTitle className="mb-2 text-sm font-semibold">
                            ویرایش مرسوله سفارش «{shipment.orderNumber}»
                        </DialogTitle>

                        <div className="mb-3 text-xs text-slate-600 flex items-center justify-between">
                            <span>مشتری: {shipment.customerName}</span>
                            <Link className="text-sky-600 hover:underline" href={`/admin/orders/${shipment.orderId}`}>
                                مشاهده سفارش
                            </Link>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">وضعیت</label>
                                    <select
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value as ShippingStatus)}
                                    >
                                        {statusOptions.map(x => (
                                            <option key={x.value} value={x.value}>{x.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">شماره پیگیری</label>
                                    <input
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        placeholder="مثلاً 123456789"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">شرکت حمل</label>
                                    <input
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                                        value={shippingCompany}
                                        onChange={(e) => setShippingCompany(e.target.value)}
                                        placeholder="پست / تیپاکس / ..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">روش ارسال</label>
                                    <input
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                                        value={shippingMethod}
                                        onChange={(e) => setShippingMethod(e.target.value)}
                                        placeholder="سریع / عادی / ..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">تاریخ ارسال</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                                        value={shippedAt}
                                        onChange={(e) => setShippedAt(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">تاریخ تحویل</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                                        value={deliveredAt}
                                        onChange={(e) => setDeliveredAt(e.target.value)}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-slate-700 mb-1">تاریخ تخمینی تحویل</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                                        value={estimatedDeliveryDate}
                                        onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
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
                                    {pending ? "در حال ذخیره..." : "ثبت تغییرات"}
                                </button>
                            </div>
                        </form>
                    </DialogPanel>
                </div>
            </Dialog>
        </>
    );
}
