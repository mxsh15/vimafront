"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { PlusIcon } from "lucide-react";
import type { DiscountDto, DiscountType, DiscountUpsertDto } from "../types";
import { upsertDiscountAction } from "../actions";
import { PersianDateTimeField } from "@/shared/components/PersianDateTimeField";
import { clientFetch } from "@/lib/fetch-client";

type Option = { id: string; title: string };
type PagedResult<T> = { items: T[] };

export default function DiscountModalButton({
    discount,
    asHeader,
    triggerVariant = "outline",
    label,
    open,
    onOpenChange,
    hideTrigger,
}: {
    discount?: DiscountDto | null;
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

    const isEdit = !!discount;

    const [form, setForm] = useState<DiscountUpsertDto>({
        title: discount?.title ?? "",
        description: discount?.description ?? "",
        type: ((discount?.type as any) ?? 0) as DiscountType,
        value: discount?.value ?? 0,

        productId: discount?.productId ?? null,
        categoryId: discount?.categoryId ?? null,
        vendorId: discount?.vendorId ?? null,
        brandId: discount?.brandId ?? null,

        minPurchaseAmount: discount?.minPurchaseAmount ?? null,
        maxDiscountAmount: discount?.maxDiscountAmount ?? null,

        validFrom: discount?.validFrom ?? null,
        validTo: discount?.validTo ?? null,

        isActive: discount?.isActive ?? true,
    });

    useEffect(() => {
        setForm({
            title: discount?.title ?? "",
            description: discount?.description ?? "",
            type: ((discount?.type as any) ?? 0) as DiscountType,
            value: discount?.value ?? 0,
            productId: discount?.productId ?? null,
            categoryId: discount?.categoryId ?? null,
            vendorId: discount?.vendorId ?? null,
            brandId: discount?.brandId ?? null,
            minPurchaseAmount: discount?.minPurchaseAmount ?? null,
            maxDiscountAmount: discount?.maxDiscountAmount ?? null,
            validFrom: discount?.validFrom ?? null,
            validTo: discount?.validTo ?? null,
            isActive: discount?.isActive ?? true,
        });
    }, [discount?.id]);

    const canSubmit = useMemo(() => {
        if (!form.title.trim()) return false;
        if (!form.value || form.value <= 0) return false;
        return true;
    }, [form]);

    const onSubmit = () => {
        if (!canSubmit) {
            return;
        }

        startTransition(async () => {
            await upsertDiscountAction(discount?.id ?? null, {
                ...form,
                type: Number(form.type) as any,
                value: Number(form.value),
                title: form.title.trim(),
                description: form.description?.trim() || null,
                productId: form.productId?.trim() || null,
                categoryId: form.categoryId?.trim() || null,
                vendorId: form.vendorId?.trim() || null,
                brandId: form.brandId?.trim() || null,
            });
            setIsOpen(false);
        });
    };

    // Big-data note: these endpoints MUST be paginated on the backend.
    // For modals, limit the pageSize (or implement search-as-you-type).
    const catsQ = useQuery({
        queryKey: ["discount-options", "categories"],
        queryFn: () => clientFetch<{ id: string; title: string }[]>("productCategories/options?onlyActive=true"),
        enabled: isOpen,
        staleTime: 5 * 60_000,
    });

    const vendorsQ = useQuery({
        queryKey: ["discount-options", "vendors"],
        queryFn: () => clientFetch<PagedResult<any>>("vendors?page=1&pageSize=200&status=active"),
        enabled: isOpen,
        staleTime: 5 * 60_000,
    });

    const brandsQ = useQuery({
        queryKey: ["discount-options", "brands"],
        queryFn: () => clientFetch<PagedResult<any>>("brands?page=1&pageSize=200&status=active"),
        enabled: isOpen,
        staleTime: 5 * 60_000,
    });

    const productsQ = useQuery({
        queryKey: ["discount-options", "products"],
        queryFn: () => clientFetch<PagedResult<any>>("products?page=1&pageSize=200"),
        enabled: isOpen,
        staleTime: 60_000,
    });

    const categoryOptions = useMemo(
        () => (catsQ.data ?? []).map(c => ({ id: c.id, title: c.title })),
        [catsQ.data]
    );
    const vendorOptions = useMemo(
        () => (vendorsQ.data?.items ?? []).map(v => ({ id: v.id, title: String(v.storeName ?? v.title ?? "") })).filter(x => x.title),
        [vendorsQ.data]
    );
    const brandOptions = useMemo(
        () => (brandsQ.data?.items ?? []).map(b => ({ id: b.id, title: b.title })),
        [brandsQ.data]
    );
    const productOptions = useMemo(
        () => (productsQ.data?.items ?? []).map(p => ({ id: p.id, title: p.title })),
        [productsQ.data]
    );

    const optionsLoading = catsQ.isLoading || vendorsQ.isLoading || brandsQ.isLoading || productsQ.isLoading;
    const optionsError = (catsQ.error as any)?.message || (vendorsQ.error as any)?.message || (brandsQ.error as any)?.message || (productsQ.error as any)?.message || null;

    const setScope = (
        scope: "productId" | "categoryId" | "vendorId" | "brandId",
        id: string | null
    ) => {
        setForm(prev => ({
            ...prev,
            [scope]: id,
        }));
    };

    // react-query handles fetching / caching / dedupe

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
                    {label ?? (isEdit ? "ویرایش تخفیف" : "افزودن تخفیف")}
                </button>
            )}

            <Dialog open={isOpen} onClose={setIsOpen} className="relative z-50">
                <DialogBackdrop className="fixed inset-0 bg-black/40" />
                <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0">
                        <DialogPanel className="relative w-full max-w-3xl overflow-hidden rounded-xl bg-[#f0f0f1] shadow-xl sm:my-6">

                            <div className="sticky top-0 z-10 bg-[#f0f0f1] border-b border-gray-300 px-4 py-3">
                                <div className="flex items-center justify-between">
                                    <DialogTitle className="text-sm font-semibold">
                                        {isEdit ? "ویرایش تخفیف" : "ایجاد تخفیف جدید"}
                                    </DialogTitle>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setIsOpen(false)} className="rounded border bg-white px-3 py-1 text-xs">
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

                            <div className="max-h-[85vh] overflow-y-auto p-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded bg-white p-3 space-y-2">
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

                                        <div className="flex items-center gap-2 pt-2">
                                            <input
                                                id="isActive"
                                                type="checkbox"
                                                checked={form.isActive}
                                                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                            />
                                            <label htmlFor="isActive" className="text-xs">فعال باشد</label>
                                        </div>
                                    </div>

                                    <div className="rounded bg-white p-3 space-y-2">
                                        <label className="block text-xs">نوع</label>
                                        <select
                                            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                            value={String(form.type)}
                                            onChange={(e) => setForm({ ...form, type: Number(e.target.value) as DiscountType })}
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

                                        <p className="text-[11px] text-gray-500">
                                            می‌توانید برای تخفیف چند فیلتر همزمان انتخاب کنید (محصول/دسته/فروشنده/برند).
                                            اگر هیچکدام انتخاب نشود، تخفیف «عمومی» است.
                                        </p>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs">محصول</label>
                                                <select
                                                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                                    value={form.productId ?? ""}
                                                    onChange={(e) => setScope("productId", e.target.value || null)}
                                                    disabled={optionsLoading}
                                                >
                                                    <option value="">بدون محصول</option>
                                                    {productOptions.map(o => (
                                                        <option key={o.id} value={o.id}>{o.title}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs">دسته‌بندی</label>
                                                <select
                                                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                                    value={form.categoryId ?? ""}
                                                    onChange={(e) => setScope("categoryId", e.target.value || null)}
                                                    disabled={optionsLoading}
                                                >
                                                    <option value="">بدون دسته‌بندی</option>
                                                    {categoryOptions.map(o => (
                                                        <option key={o.id} value={o.id}>{o.title}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs">فروشنده</label>
                                                <select
                                                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                                    value={form.vendorId ?? ""}
                                                    onChange={(e) => setScope("vendorId", e.target.value || null)}
                                                    disabled={optionsLoading}
                                                >
                                                    <option value="">بدون فروشنده</option>
                                                    {vendorOptions.map(o => (
                                                        <option key={o.id} value={o.id}>{o.title}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs">برند</label>
                                                <select
                                                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                                    value={form.brandId ?? ""}
                                                    onChange={(e) => setScope("brandId", e.target.value || null)}
                                                    disabled={optionsLoading}
                                                >
                                                    <option value="">بدون برند</option>
                                                    {brandOptions.map(o => (
                                                        <option key={o.id} value={o.id}>{o.title}</option>
                                                    ))}
                                                </select>
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
