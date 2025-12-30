"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import type { ShippingZoneListItemDto } from "../types";
import { createShippingZoneAction, updateShippingZoneAction } from "../actions";
import { IranProvinceKey, IRAN_CITIES_BY_PROVINCE, IRAN_PROVINCES } from "@/lib/geo/iran";

type Props = {
    open: boolean;
    onClose: () => void;
    mode: "create" | "edit";
    initial?: ShippingZoneListItemDto | null;
};

export default function ShippingZoneUpsertDialog({ open, onClose, mode, initial }: Props) {
    const [pending, startTransition] = useTransition();

    const defaults = useMemo(() => {
        const countryCode = "IR";
        const province = (initial?.province ?? "") as IranProvinceKey | "";
        const cities = province ? IRAN_CITIES_BY_PROVINCE[province] ?? [] : [];
        const city = cities.includes(initial?.city ?? "") ? (initial?.city ?? "") : "";

        return {
            title: initial?.title ?? "",
            description: "",
            status: String(initial?.status ?? true),
            sortOrder: String(initial?.sortOrder ?? 0),

            countryCode,      // فقط ایران
            province,         // استان ایران
            city,             // شهر وابسته
            postalCodePattern: "",
        };
    }, [initial]);


    const [state, setState] = useState(defaults);

    useEffect(() => setState(defaults), [defaults, open]);

    return (
        <Dialog open={open} onClose={() => !pending && onClose()} className="relative z-50">
            <DialogBackdrop className="fixed inset-0 bg-black/30" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="w-full max-w-2xl rounded-2xl bg-white p-4 shadow-lg">
                    <DialogTitle className="text-sm font-semibold text-slate-800">
                        {mode === "create" ? "ایجاد منطقه ارسال" : "ویرایش منطقه ارسال"}
                    </DialogTitle>

                    <form
                        className="mt-4 space-y-3"
                        onSubmit={(e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget);
                            startTransition(async () => {
                                if (mode === "create") await createShippingZoneAction(fd);
                                else await updateShippingZoneAction(initial!.id, fd);
                                onClose();
                            });
                        }}
                    >
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="block text-right sm:col-span-2">
                                <span className="mb-1 block text-xs text-slate-500">عنوان</span>
                                <input
                                    name="title"
                                    value={state.title}
                                    onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))}
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </label>

                            <label className="block text-right sm:col-span-2">
                                <span className="mb-1 block text-xs text-slate-500">توضیحات</span>
                                <textarea
                                    name="description"
                                    value={state.description}
                                    onChange={(e) => setState((s) => ({ ...s, description: e.target.value }))}
                                    className="min-h-[80px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </label>

                            <label className="block text-right">
                                <span className="mb-1 block text-xs text-slate-500">وضعیت</span>
                                <select
                                    name="status"
                                    value={state.status}
                                    onChange={(e) => setState((s) => ({ ...s, status: e.target.value }))}
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="true">فعال</option>
                                    <option value="false">غیرفعال</option>
                                </select>
                            </label>

                            <label className="block text-right">
                                <span className="mb-1 block text-xs text-slate-500">ترتیب</span>
                                <input
                                    name="sortOrder"
                                    type="number"
                                    value={state.sortOrder}
                                    onChange={(e) => setState((s) => ({ ...s, sortOrder: e.target.value }))}
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </label>

                            {/* کشور */}
                            <label className="block text-right">
                                <span className="mb-1 block text-xs text-slate-500">کشور</span>
                                <select
                                    name="countryCode"
                                    value={state.countryCode}
                                    onChange={(e) => {
                                        // فعلاً فقط IR داریم، اما برای آینده آماده است
                                        const cc = e.target.value || "IR";
                                        setState((s) => ({
                                            ...s,
                                            countryCode: cc,
                                            province: "",
                                            city: "",
                                        }));
                                    }}
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="IR">ایران (IR)</option>
                                </select>
                            </label>

                            {/* استان */}
                            <label className="block text-right">
                                <span className="mb-1 block text-xs text-slate-500">استان</span>
                                <select
                                    name="province"
                                    value={state.province}
                                    onChange={(e) => {
                                        const p = (e.target.value || "") as IranProvinceKey | "";
                                        const firstCity = p ? (IRAN_CITIES_BY_PROVINCE[p]?.[0] ?? "") : "";
                                        setState((s) => ({
                                            ...s,
                                            province: p,
                                            city: "", // بهتر: خالی شود تا کاربر انتخاب کند
                                        }));
                                    }}
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">انتخاب استان...</option>
                                    {IRAN_PROVINCES.map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </label>

                            {/* شهر */}
                            <label className="block text-right">
                                <span className="mb-1 block text-xs text-slate-500">شهر</span>
                                <select
                                    name="city"
                                    value={state.city}
                                    onChange={(e) => setState((s) => ({ ...s, city: e.target.value }))}
                                    disabled={!state.province}
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                                >
                                    <option value="">{state.province ? "انتخاب شهر..." : "ابتدا استان را انتخاب کنید"}</option>
                                    {(state.province ? (IRAN_CITIES_BY_PROVINCE[state.province as IranProvinceKey] ?? []) : []).map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </label>


                            <label className="block text-right">
                                <span className="mb-1 block text-xs text-slate-500">الگوی کدپستی</span>
                                <input
                                    name="postalCodePattern"
                                    value={state.postalCodePattern}
                                    onChange={(e) => setState((s) => ({ ...s, postalCodePattern: e.target.value }))}
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="مثلاً ^10\\d{8}$"
                                />
                            </label>
                        </div>

                        <div className="mt-4 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={pending}
                                className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-60"
                            >
                                انصراف
                            </button>
                            <button
                                type="submit"
                                disabled={pending}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
                            >
                                {pending ? "در حال ذخیره..." : "ذخیره"}
                            </button>
                        </div>
                    </form>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
