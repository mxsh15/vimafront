"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adjustWalletAction } from "../actions";

export function WalletAdjustBox({ vendorId }: { vendorId: string }) {
    const router = useRouter();
    const [amount, setAmount] = useState<number>(0);
    const [description, setDescription] = useState("");
    const [referenceNumber, setReferenceNumber] = useState("");

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold text-slate-700">تعدیل دستی کیف پول</div>

            <label className="mt-2 block text-[11px] text-slate-500">Amount (+/-)</label>
            <input
                value={String(amount)}
                onChange={(e) => setAmount(Number(e.target.value || 0))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none"
                placeholder="مثلاً 100000 یا -50000"
            />

            <label className="mt-2 block text-[11px] text-slate-500">Description</label>
            <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none"
                placeholder="علت تعدیل..."
            />

            <label className="mt-2 block text-[11px] text-slate-500">Reference</label>
            <input
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-mono outline-none"
                placeholder="شماره سند/رسید..."
            />

            <button
                type="button"
                onClick={async () => {
                    if (!amount) return;
                    const ok = window.confirm("تعدیل اعمال شود؟");
                    if (!ok) return;
                    await adjustWalletAction(vendorId, { amount, description, referenceNumber });
                    router.refresh();
                }}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-700"
            >
                اعمال تعدیل
            </button>
        </div>
    );
}
