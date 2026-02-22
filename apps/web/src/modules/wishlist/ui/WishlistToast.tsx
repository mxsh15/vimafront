"use client";

import Link from "next/link";
import { useEffect } from "react";

export function WishlistToast({
    open,
    onClose,
    added,
    durationMs = 3500,
    wishlistHref = "/account/wishlist",
}: {
    open: boolean;
    onClose: () => void;
    added: boolean;
    durationMs?: number;
    wishlistHref?: string;
}) {
    useEffect(() => {
        if (!open) return;
        const t = window.setTimeout(() => onClose(), durationMs);
        return () => window.clearTimeout(t);
    }, [open, durationMs, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-x-0 top-4 z-[999999] flex justify-center px-3">
            <div
                className="w-full max-w-[560px] rounded-xl border border-[var(--color-neutral-200)] bg-white shadow-lg px-3 py-2"
                role="status"
                aria-live="polite"
            >
                <div className="flex items-start gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="mt-0.5 grid h-9 w-9 place-items-center rounded-lg text-[var(--color-icon-high-emphasis)]"
                        aria-label="بستن"
                        title="بستن"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M6 6l12 12M18 6 6 18"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            {added ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M20 6 9 17l-5-5"
                                        stroke="#16a34a"
                                        strokeWidth="2.4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M18 6 6 18M6 6l12 12"
                                        stroke="#e11d48"
                                        strokeWidth="2.4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            )}

                            <div
                                className={
                                    "truncate text-[14px] font-bold " +
                                    (added ? "text-[#16a34a]" : "text-[#e11d48]")
                                }
                            >
                                {added
                                    ? "این محصول به لیست علاقه‌مندی‌های شما اضافه شد."
                                    : "این محصول از لیست علاقه‌مندی‌های شما حذف شد."}
                            </div>
                        </div>

                        <div className="mt-1">
                            <Link
                                href={wishlistHref}
                                className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--color-button-secondary)] hover:underline"
                            >
                                مشاهده لیست علاقه‌مندی‌ها
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M14 6 8 12l6 6"
                                        stroke="currentColor"
                                        strokeWidth="2.2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}