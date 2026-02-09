"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminVendorPayoutDetailDto } from "../types";
import { decidePayoutAction, completePayoutAction } from "../actions";

export function PayoutDetailActions({ payout }: { payout: AdminVendorPayoutDetailDto }) {
    const router = useRouter();
    const [adminNotes, setAdminNotes] = useState(payout.adminNotes ?? "");
    const [referenceNumber, setReferenceNumber] = useState("");

    const canDecision = payout.status === "Pending";
    const canComplete = payout.status === "Processing";

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold text-slate-700">عملیات</div>

            <label className="mt-2 block text-[11px] text-slate-500">یادداشت</label>
            <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none"
            />

            <div className="mt-2 flex flex-wrap gap-2">
                <button
                    type="button"
                    disabled={!canDecision}
                    onClick={async () => {
                        const ok = window.confirm("این درخواست تایید شود و به حالت Processing برود؟");
                        if (!ok) return;
                        await decidePayoutAction(payout.id, { approve: true, adminNotes });
                        router.refresh();
                    }}
                    className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-[11px] font-medium text-emerald-700 disabled:opacity-50"
                >
                    تایید
                </button>

                <button
                    type="button"
                    disabled={!canDecision}
                    onClick={async () => {
                        const ok = window.confirm("این درخواست رد شود؟");
                        if (!ok) return;
                        await decidePayoutAction(payout.id, { approve: false, adminNotes });
                        router.refresh();
                    }}
                    className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-[11px] font-medium text-rose-700 disabled:opacity-50"
                >
                    رد
                </button>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-3">
                <div className="text-[11px] font-semibold text-slate-700">تکمیل پرداخت</div>

                <label className="mt-2 block text-[11px] text-slate-500">Reference / رسید</label>
                <input
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-mono outline-none"
                    placeholder="شناسه حواله/رسید..."
                />

                <button
                    type="button"
                    disabled={!canComplete}
                    onClick={async () => {
                        const ok = window.confirm("پرداخت تکمیل شود؟ (Withdrawal ثبت می‌شود)");
                        if (!ok) return;
                        await completePayoutAction(payout.id, { referenceNumber, adminNotes });
                        router.refresh();
                    }}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-700 disabled:opacity-50"
                >
                    ثبت به عنوان Completed
                </button>
            </div>
        </div>
    );
}
