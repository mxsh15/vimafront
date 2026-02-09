"use client";

import { useMemo, useState, useTransition } from "react";
import type { ShippingMethodListItemDto } from "@/modules/shipping-methods/types";
import type { ShippingZoneRateDto } from "../types";
import { upsertShippingZoneRatesAction } from "../actions";

function numOrNull(v: string) {
    const s = v.trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
}

export default function ZoneRatesEditor({
    zoneId,
    methods,
    initialRates,
}: {
    zoneId: string;
    methods: ShippingMethodListItemDto[];
    initialRates: ShippingZoneRateDto[];
}) {
    const [pending, startTransition] = useTransition();

    const initialMap = useMemo(() => {
        const m = new Map<string, ShippingZoneRateDto>();
        for (const r of initialRates) m.set(r.shippingMethodId, r);
        return m;
    }, [initialRates]);

    const [rows, setRows] = useState(() =>
        methods.map((m) => {
            const r = initialMap.get(m.id);
            return {
                shippingMethodId: m.id,
                methodTitle: m.title,
                price: r?.price != null ? String(r.price) : "",
                minOrderAmount: r?.minOrderAmount != null ? String(r.minOrderAmount) : "",
                freeShippingMinOrderAmount: r?.freeShippingMinOrderAmount != null ? String(r.freeShippingMinOrderAmount) : "",
                etaDaysMin: r?.etaDaysMin != null ? String(r.etaDaysMin) : "",
                etaDaysMax: r?.etaDaysMax != null ? String(r.etaDaysMax) : "",
            };
        })
    );

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-700">روش‌ها و نرخ‌ها</div>

                <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                        const payload: ShippingZoneRateDto[] = rows.map((r) => ({
                            shippingMethodId: r.shippingMethodId,
                            price: Number(r.price || 0),
                            minOrderAmount: numOrNull(r.minOrderAmount),
                            freeShippingMinOrderAmount: numOrNull(r.freeShippingMinOrderAmount),
                            etaDaysMin: numOrNull(r.etaDaysMin),
                            etaDaysMax: numOrNull(r.etaDaysMax),
                        }));

                        startTransition(async () => {
                            await upsertShippingZoneRatesAction(zoneId, payload);
                        });
                    }}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
                >
                    {pending ? "در حال ذخیره..." : "ذخیره نرخ‌ها"}
                </button>
            </div>

            <div className="overflow-auto">
                <table className="min-w-[900px] w-full border-collapse">
                    <thead>
                        <tr className="text-right text-xs text-slate-500">
                            <th className="border-b px-2 py-2">روش</th>
                            <th className="border-b px-2 py-2">قیمت</th>
                            <th className="border-b px-2 py-2">حداقل سفارش</th>
                            <th className="border-b px-2 py-2">ارسال رایگان از</th>
                            <th className="border-b px-2 py-2">ETA حداقل</th>
                            <th className="border-b px-2 py-2">ETA حداکثر</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, idx) => (
                            <tr key={r.shippingMethodId} className="text-sm">
                                <td className="border-b px-2 py-2 text-xs text-slate-700">{r.methodTitle}</td>

                                <td className="border-b px-2 py-2">
                                    <input
                                        value={r.price}
                                        onChange={(e) =>
                                            setRows((prev) => {
                                                const next = [...prev];
                                                next[idx] = { ...next[idx], price: e.target.value };
                                                return next;
                                            })
                                        }
                                        className="w-36 rounded-md border border-gray-200 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="مثلاً 50000"
                                    />
                                </td>

                                <td className="border-b px-2 py-2">
                                    <input
                                        value={r.minOrderAmount}
                                        onChange={(e) =>
                                            setRows((prev) => {
                                                const next = [...prev];
                                                next[idx] = { ...next[idx], minOrderAmount: e.target.value };
                                                return next;
                                            })
                                        }
                                        className="w-36 rounded-md border border-gray-200 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="اختیاری"
                                    />
                                </td>

                                <td className="border-b px-2 py-2">
                                    <input
                                        value={r.freeShippingMinOrderAmount}
                                        onChange={(e) =>
                                            setRows((prev) => {
                                                const next = [...prev];
                                                next[idx] = { ...next[idx], freeShippingMinOrderAmount: e.target.value };
                                                return next;
                                            })
                                        }
                                        className="w-36 rounded-md border border-gray-200 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="اختیاری"
                                    />
                                </td>

                                <td className="border-b px-2 py-2">
                                    <input
                                        value={r.etaDaysMin}
                                        onChange={(e) =>
                                            setRows((prev) => {
                                                const next = [...prev];
                                                next[idx] = { ...next[idx], etaDaysMin: e.target.value };
                                                return next;
                                            })
                                        }
                                        className="w-24 rounded-md border border-gray-200 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="مثلاً 1"
                                    />
                                </td>

                                <td className="border-b px-2 py-2">
                                    <input
                                        value={r.etaDaysMax}
                                        onChange={(e) =>
                                            setRows((prev) => {
                                                const next = [...prev];
                                                next[idx] = { ...next[idx], etaDaysMax: e.target.value };
                                                return next;
                                            })
                                        }
                                        className="w-24 rounded-md border border-gray-200 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="مثلاً 3"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-2 text-xs text-slate-500">
                    قیمت‌ها عددی هستند (تومان). اگر قیمت را 0 بگذاری یعنی برای آن روش در این منطقه هزینه‌ای ندارد.
                </div>
            </div>
        </div>
    );
}
