"use client";

import Link from "next/link";
import { useEffect } from "react";

export function CartAddedToast({
    open,
    onClose,
    durationMs = 3500,
}: {
    open: boolean;
    onClose: () => void;
    durationMs?: number;
}) {
    useEffect(() => {
        if (!open) return;
        const t = window.setTimeout(() => onClose(), durationMs);
        return () => window.clearTimeout(t);
    }, [open, durationMs, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-x-0 bottom-4 z-[999999] flex justify-center px-3">
            <div
                className="
          w-full max-w-[520px]
          rounded-xl border border-[var(--color-neutral-200)]
          bg-white shadow-lg
          px-3 py-2
        "
                role="status"
                aria-live="polite"
            >
                <div className="flex items-center gap-2">
                    {/* close */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="grid h-9 w-9 place-items-center rounded-lg text-[var(--color-icon-high-emphasis)]"
                        aria-label="بستن"
                        title="بستن"
                    >
                        {/* X icon */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M6 6l12 12M18 6 6 18"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>

                    {/* message */}
                    <div className="flex min-w-0 items-center gap-2">
                        {/* check */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M20 6 9 17l-5-5"
                                stroke="#16a34a"
                                strokeWidth="2.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>

                        <div className="truncate text-[14px] font-bold text-[#16a34a]">
                            کالا به سبد اضافه شد!
                        </div>
                    </div>

                    <div className="flex-1" />

                    {/* go to cart */}
                    <Link
                        href="/cart"
                        className="
              inline-flex items-center gap-1
              rounded-lg px-2 py-2
              text-[13px] font-medium text-[var(--color-neutral-900)]
              hover:bg-[var(--color-neutral-100)]
              whitespace-nowrap
            "
                    >
                        برو به سبد خرید
                        {/* chevron (left) */}
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
    );
}
