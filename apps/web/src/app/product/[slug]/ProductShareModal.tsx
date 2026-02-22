"use client";

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { Copy, X } from "lucide-react";
import { useEffect, useState } from "react";

async function copyText(text: string) {
    // Clipboard API (HTTPS/localhost)
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }

    // Fallback (old browsers / insecure context)
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.left = "0";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
}

export default function ProductShareModal({
    open,
    onClose,
    url,
}: {
    open: boolean;
    onClose: () => void;
    url: string;
}) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (open) setCopied(false);
    }, [open]);

    return (
        <Dialog open={open} onClose={onClose} className="relative z-[999999]">
            <DialogBackdrop className="fixed inset-0 bg-black/40" />

            <div className="fixed inset-0 flex items-center justify-center p-4" dir="rtl" lang="fa">
                <DialogPanel className="w-full max-w-[520px] rounded-2xl bg-white shadow-xl border border-[var(--color-neutral-200)]">
                    <div className="flex items-center justify-between px-5 py-4">
                        <DialogTitle className="text-h5-regular-180 text-neutral-900">
                            اشتراک‌گذاری
                        </DialogTitle>

                        <button
                            type="button"
                            onClick={onClose}
                            className="grid h-9 w-9 place-items-center rounded-lg text-neutral-500 hover:bg-[var(--color-neutral-100)]"
                            aria-label="بستن"
                            title="بستن"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="h-px bg-[var(--color-neutral-200)]" />

                    <div className="px-5 py-5">
                        <p className="text-body-2 text-neutral-700 [font-family:var(--font-iransans)]">
                            این کالا را با دوستان خود به اشتراک بگذارید!
                        </p>

                        <button
                            type="button"
                            onClick={async () => {
                                try {
                                    await copyText(url);
                                    setCopied(true);
                                    window.setTimeout(() => setCopied(false), 2000);
                                } catch {
                                    // اگر حتی fallback هم شکست خورد، دیگه مشکل از مرورگره نه تو.
                                    setCopied(false);
                                }
                            }}
                            className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-[var(--color-neutral-300)] px-4 py-3 text-body-2 text-neutral-900 hover:bg-[var(--color-neutral-100)]"
                        >
                            <span className="text-body-2 text-neutral-900 [font-family:var(--font-iransans)]">
                                کپی کردن لینک
                            </span>
                            <Copy className="h-5 w-5 text-neutral-700" />
                        </button>

                        {copied && (
                            <div className="mt-3 text-body-2 text-[#16a34a] [font-family:var(--font-iransans)]">
                                لینک کپی شد.
                            </div>
                        )}
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}