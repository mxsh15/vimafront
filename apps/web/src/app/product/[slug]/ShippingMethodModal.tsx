"use client";

import { X, Truck } from "lucide-react";

export function ShippingMethodModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center px-3">
            {/* Backdrop */}
            <button
                type="button"
                aria-label="بستن"
                onClick={onClose}
                className="absolute inset-0 bg-black/40"
            />

            {/* Modal */}
            <div className="relative w-full max-w-[720px] rounded-2xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="grid h-10 w-10 place-items-center rounded-xl text-neutral-700 hover:bg-neutral-100"
                        aria-label="بستن"
                        title="بستن"
                    >
                        <X size={22} />
                    </button>

                    <h3 className="text-[18px] font-bold text-neutral-900 [font-family:var(--font-iransans)]">
                        روش و هزینه ارسال
                    </h3>

                    {/* spacer to keep title centered */}
                    <div className="h-10 w-10" />
                </div>

                <div className="h-px w-full bg-[var(--color-neutral-200)]" />

                {/* Body */}
                <div className="px-6 py-6">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 text-[var(--color-button-primary)]">
                            <Truck size={24} className="scale-x-[-1]" />
                        </div>

                        <div className="flex-1">
                            <div className="text-[15px] font-bold text-neutral-900 [font-family:var(--font-iransans)]">
                                توسط دیجی‌کالا: <span className="font-semibold">تامین از ۱ روز کاری دیگر</span>
                            </div>

                            <p className="mt-3 text-[13px] leading-6 text-neutral-600 [font-family:var(--font-iransans)]">
                                این کالا پس از مدت زمان مشخص شده توسط فروشنده در انبار دیجی‌کالا تامین و آماده
                                پردازش می‌گردد و توسط پیک دیجی‌کالا در بازه انتخابی ارسال خواهد شد.
                            </p>
                        </div>
                    </div>

                    {/* Action */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="
              mt-8 w-full rounded-2xl bg-neutral-100
              py-4 text-[16px] font-bold text-neutral-900
              [font-family:var(--font-iransans)]
            "
                    >
                        باشه، فهمیدم
                    </button>
                </div>
            </div>
        </div>
    );
}
