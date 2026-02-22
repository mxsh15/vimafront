"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { X } from "lucide-react";
import { getProductPriceHistory } from "@/modules/product/price-history";
import PriceHistoryChart from "./PriceHistoryChart";

export default function PriceHistoryModal({
    open,
    onClose,
    productId,
    productTitle,
}: {
    open: boolean;
    onClose: () => void;
    productId: string;
    productTitle?: string | null;
}) {
    const q = useQuery({
        queryKey: ["product-price-history", productId],
        queryFn: () => getProductPriceHistory(productId, 180),
        enabled: open && !!productId,
        staleTime: 60_000,
    });

    const points = useMemo(() => q.data?.points ?? [], [q.data]);

    return (
        <Dialog open={open} onClose={onClose} className="relative z-[1000]">
            <DialogBackdrop className="fixed inset-0 bg-black/40" />

            <div className="fixed inset-0 overflow-y-auto">
                <div className="min-h-full flex items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-[980px] rounded-3xl bg-white shadow-[var(--shadow-modal)] border border-[var(--color-neutral-200)]">
                        {/* header */}
                        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[var(--color-neutral-100)]">
                            <div className="min-w-0">
                                <div className="text-h4 text-neutral-850 [font-family:var(--font-iransans)]">
                                    نمودار قیمت فروش
                                </div>
                                <div className="mt-1 text-body-2 text-neutral-600 [font-family:var(--font-iransans)] truncate">
                                    {productTitle ?? ""}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="shrink-0 rounded-full p-2 hover:bg-[var(--color-neutral-50)]"
                                aria-label="بستن"
                                title="بستن"
                            >
                                <X className="h-5 w-5 text-neutral-700" />
                            </button>
                        </div>

                        {/* body */}
                        <div className="px-6 py-6">
                            {q.isLoading ? (
                                <div className="py-10 text-body-2 text-neutral-500 [font-family:var(--font-iransans)]">
                                    در حال بارگذاری…
                                </div>
                            ) : q.isError ? (
                                <div className="py-10 text-body-2 text-red-600 [font-family:var(--font-iransans)]">
                                    خطا در دریافت داده‌های نمودار
                                </div>
                            ) : (
                                <PriceHistoryChart points={points} />
                            )}
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}