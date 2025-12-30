"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import type { ShippingMethodListItemDto } from "../types";
import { createShippingMethodAction, updateShippingMethodAction } from "../actions";

type Props = {
    open: boolean;
    onClose: () => void;
    mode: "create" | "edit";
    initial?: ShippingMethodListItemDto | null;
};

export default function ShippingMethodUpsertDialog({ open, onClose, mode, initial }: Props) {
    const [pending, startTransition] = useTransition();

    const defaults = useMemo(() => {
        return {
            title: initial?.title ?? "",
            code: initial?.code ?? "",
            description: "",
            status: String(initial?.status ?? true),
            sortOrder: String(initial?.sortOrder ?? 0),
            defaultPrice: initial?.defaultPrice == null ? "" : String(initial.defaultPrice),
        };
    }, [initial]);

    const [state, setState] = useState(defaults);

    useEffect(() => setState(defaults), [defaults, open]);

    return (
        <Dialog open={open} onClose={() => !pending && onClose()} className="relative z-50">
            <DialogBackdrop className="fixed inset-0 bg-black/30" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-lg">
                    <DialogTitle className="text-sm font-semibold text-slate-800">
                        {mode === "create" ? "ایجاد روش ارسال" : "ویرایش روش ارسال"}
                    </DialogTitle>

                    <form
                        className="mt-4 space-y-3"
                        onSubmit={(e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget);
                            startTransition(async () => {
                                if (mode === "create") await createShippingMethodAction(fd);
                                else await updateShippingMethodAction(initial!.id, fd);
                                onClose();
                            });
                        }}
                    >
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="block text-right">
                                <span className="mb-1 block text-xs text-slate-500">عنوان</span>
                                <input
                                    name="title"
                                    value={state.title}
                                    onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))}
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </label>

                            {mode === "edit" ? (
                                <div className="sm:col-span-2 text-right">
                                    <div className="mb-1 text-xs text-slate-500">کد سیستم</div>
                                    <div className="rounded-md border border-gray-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700">
                                        {initial?.code}
                                    </div>
                                </div>
                            ) : null}

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

                            <label className="block text-right sm:col-span-2">
                                <span className="mb-1 block text-xs text-slate-500">قیمت پیش‌فرض (اختیاری)</span>
                                <input
                                    name="defaultPrice"
                                    type="number"
                                    value={state.defaultPrice}
                                    onChange={(e) => setState((s) => ({ ...s, defaultPrice: e.target.value }))}
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
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
