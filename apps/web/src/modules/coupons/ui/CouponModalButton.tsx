"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { PlusIcon } from "lucide-react";
import { CouponDto, CouponUpsertDto, CouponType } from "../types";
import { upsertCouponAction } from "../actions";
import { PersianDateTimeField } from "@/shared/components/PersianDateTimeField";

function toInputDateTime(iso?: string | null) {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromInputDateTime(v: string) {
    if (!v.trim()) return null;
    return new Date(v).toISOString();
}

export default function CouponModalButton({
    coupon,
    asHeader,
    triggerVariant = "outline",
    label,
    open,
    onOpenChange,
    hideTrigger,
}: {
    coupon?: CouponDto | null;
    asHeader?: boolean;
    triggerVariant?: "primary" | "outline";
    label?: string;
    open?: boolean;
    onOpenChange?: (v: boolean) => void;
    hideTrigger?: boolean;
}) {
    const [pending, startTransition] = useTransition();

    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = typeof open === "boolean" && typeof onOpenChange === "function";
    const isOpen = isControlled ? (open as boolean) : internalOpen;
    const setIsOpen = isControlled ? (onOpenChange as (v: boolean) => void) : setInternalOpen;

    const isEdit = !!coupon;

    const [form, setForm] = useState<CouponUpsertDto>({
        code: coupon?.code ?? "",
        title: coupon?.title ?? "",
        description: coupon?.description ?? "",
        type: (coupon?.type ?? "Percentage") as CouponType,
        value: coupon?.value ?? 0,
        minPurchaseAmount: coupon?.minPurchaseAmount ?? null,
        maxDiscountAmount: coupon?.maxDiscountAmount ?? null,
        maxUsageCount: coupon?.maxUsageCount ?? null,
        maxUsagePerUser: coupon?.maxUsagePerUser ?? null,
        validFrom: coupon?.validFrom ?? null,
        validTo: coupon?.validTo ?? null,
    });

    useEffect(() => {
        setForm({
            code: coupon?.code ?? "",
            title: coupon?.title ?? "",
            description: coupon?.description ?? "",
            type: ((coupon?.type as any) ?? 0) as CouponType,
            value: coupon?.value ?? 0,
            minPurchaseAmount: coupon?.minPurchaseAmount ?? null,
            maxDiscountAmount: coupon?.maxDiscountAmount ?? null,
            maxUsageCount: coupon?.maxUsageCount ?? null,
            maxUsagePerUser: coupon?.maxUsagePerUser ?? null,
            validFrom: coupon?.validFrom ?? null,
            validTo: coupon?.validTo ?? null,
        });
    }, [coupon?.id]);

    const canSubmit = useMemo(() => {
        if (!form.code.trim()) return false;
        if (!form.title.trim()) return false;
        if (!form.value || form.value <= 0) return false;
        return true;
    }, [form]);

    const onSubmit = () => {
        if (!canSubmit) return;
        startTransition(async () => {
            await upsertCouponAction(coupon?.id ?? null, {
                ...form,
                code: form.code.trim(),
                title: form.title.trim(),
                description: form.description?.trim() || null,
            });
            setIsOpen(false);
        });
    };

    return (
        <>
            {!hideTrigger && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className={
                        triggerVariant === "primary"
                            ? "inline-flex items-center gap-1 rounded bg-emerald-600 px-3 py-1.5 text-xs text-white"
                            : "inline-flex items-center gap-1 rounded border px-3 py-1.5 text-xs"
                    }
                >
                    {!isEdit && <PlusIcon size={14} />}
                    {label ?? (isEdit ? "ویرایش کوپن" : "افزودن کوپن")}
                </button>
            )}

            <Dialog open={isOpen} onClose={setIsOpen} className="relative z-50">
                <DialogBackdrop className="fixed inset-0 bg-black/40" />
                <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0">
                        <DialogPanel className="relative w-full max-w-3xl overflow-hidden rounded-xl bg-[#f0f0f1] shadow-xl sm:my-6">

                            {/* Header */}
                            <div className="sticky top-0 z-10 bg-[#f0f0f1] border-b border-gray-300 px-4 py-3">
                                <div className="flex items-center justify-between">
                                    <DialogTitle className="text-sm font-semibold">
                                        {isEdit ? "ویرایش کوپن" : "ایجاد کوپن جدید"}
                                    </DialogTitle>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsOpen(false)}
                                            className="rounded border bg-white px-3 py-1 text-xs"
                                        >
                                            انصراف
                                        </button>

                                        <button
                                            type="button"
                                            disabled={pending || !canSubmit}
                                            onClick={onSubmit}
                                            className="rounded bg-blue-600 px-4 py-1 text-xs text-white disabled:opacity-60"
                                        >
                                            {pending ? "در حال ذخیره..." : "ذخیره"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="max-h-[85vh] overflow-y-auto p-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded bg-white p-3 space-y-2">
                                        <label className="block text-xs">کد</label>
                                        <input
                                            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                            value={form.code}
                                            onChange={(e) => setForm({ ...form, code: e.target.value })}
                                        />

                                        <label className="block text-xs">عنوان</label>
                                        <input
                                            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        />

                                        <label className="block text-xs">توضیحات</label>
                                        <textarea
                                            rows={3}
                                            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                            value={form.description ?? ""}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="rounded bg-white p-3 space-y-2">
                                        <label className="block text-xs">نوع</label>
                                        <select
                                            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                            value={String(form.type)}
                                            onChange={(e) => setForm({ ...form, type: Number(e.target.value) as CouponType })}
                                        >
                                            <option value="0">درصدی</option>
                                            <option value="1">مبلغ ثابت</option>
                                        </select>

                                        <label className="block text-xs">مقدار</label>
                                        <input
                                            type="number"
                                            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                            value={form.value}
                                            onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                                        />

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs">حداقل خرید</label>
                                                <input
                                                    type="number"
                                                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                                    value={form.minPurchaseAmount ?? ""}
                                                    onChange={(e) => setForm({ ...form, minPurchaseAmount: e.target.value ? Number(e.target.value) : null })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs">حداکثر تخفیف</label>
                                                <input
                                                    type="number"
                                                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                                    value={form.maxDiscountAmount ?? ""}
                                                    onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value ? Number(e.target.value) : null })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <PersianDateTimeField
                                                    label="از تاریخ"
                                                    valueIso={form.validFrom ?? null}
                                                    onChangeIso={(iso) => setForm({ ...form, validFrom: iso })}
                                                />
                                            </div>
                                            <div>
                                                <PersianDateTimeField
                                                    label="تا تاریخ"
                                                    valueIso={form.validTo ?? null}
                                                    onChangeIso={(iso) => setForm({ ...form, validTo: iso })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs">حداکثر استفاده</label>
                                                <input
                                                    type="number"
                                                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                                    value={form.maxUsageCount ?? ""}
                                                    onChange={(e) => setForm({ ...form, maxUsageCount: e.target.value ? Number(e.target.value) : null })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs">حداکثر هر کاربر</label>
                                                <input
                                                    type="number"
                                                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                                    value={form.maxUsagePerUser ?? ""}
                                                    onChange={(e) => setForm({ ...form, maxUsagePerUser: e.target.value ? Number(e.target.value) : null })}
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    );
}
