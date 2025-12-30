"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminReturnDetailDto } from "../types";
import {
    reviewAdminReturnAction,
    completeAdminReturnAction,
    createRefundForReturnAction,
} from "../actions";

export function ReturnDetailActions({
    returnId,
    current,
}: {
    returnId: string;
    current: AdminReturnDetailDto;
}) {
    const router = useRouter();
    const [adminNotes, setAdminNotes] = useState(current.adminNotes ?? "");
    const [paymentId, setPaymentId] = useState(current.refund?.paymentId ?? "");
    const [amount, setAmount] = useState<number>(current.refund?.amount ?? 0);

    const disabledApproveReject = current.status !== "Pending";
    const disabledComplete = current.status !== "Approved";
    const disabledCreateRefund = !!current.refund;

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold text-slate-700">عملیات</div>

            <div className="mt-2">
                <label className="block text-[11px] text-slate-500">یادداشت ادمین</label>
                <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none"
                    rows={3}
                    placeholder="مثلاً: بسته‌بندی آسیب دیده بود..."
                />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                <button
                    type="button"
                    disabled={disabledApproveReject}
                    onClick={async () => {
                        const ok = window.confirm("این درخواست تایید شود؟");
                        if (!ok) return;
                        await reviewAdminReturnAction(returnId, { approve: true, adminNotes });
                        router.refresh();
                    }}
                    className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-[11px] font-medium text-emerald-700 disabled:opacity-50"
                >
                    تایید
                </button>

                <button
                    type="button"
                    disabled={disabledApproveReject}
                    onClick={async () => {
                        const ok = window.confirm("این درخواست رد شود؟");
                        if (!ok) return;
                        await reviewAdminReturnAction(returnId, { approve: false, adminNotes });
                        router.refresh();
                    }}
                    className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-[11px] font-medium text-rose-700 disabled:opacity-50"
                >
                    رد
                </button>

                <button
                    type="button"
                    disabled={disabledComplete}
                    onClick={async () => {
                        const ok = window.confirm("این درخواست تکمیل شود؟");
                        if (!ok) return;
                        await completeAdminReturnAction(returnId, adminNotes);
                        router.refresh();
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-700 disabled:opacity-50"
                >
                    تکمیل
                </button>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-3">
                <div className="text-[11px] font-semibold text-slate-700">ثبت Refund</div>

                <label className="mt-2 block text-[11px] text-slate-500">PaymentId</label>
                <input
                    value={paymentId}
                    onChange={(e) => setPaymentId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-mono outline-none"
                    placeholder="GUID PaymentId"
                    disabled={disabledCreateRefund}
                />

                <label className="mt-2 block text-[11px] text-slate-500">Amount (تومان)</label>
                <input
                    value={String(amount ?? 0)}
                    onChange={(e) => setAmount(Number(e.target.value || 0))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none"
                    placeholder="مثلاً 250000"
                    disabled={disabledCreateRefund}
                />

                <button
                    type="button"
                    disabled={disabledCreateRefund || !paymentId || amount <= 0}
                    onClick={async () => {
                        const ok = window.confirm("Refund ثبت شود؟");
                        if (!ok) return;
                        await createRefundForReturnAction(returnId, { paymentId, amount });
                        router.refresh();
                    }}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-700 disabled:opacity-50"
                >
                    ثبت Refund
                </button>

                {disabledCreateRefund ? (
                    <div className="mt-2 text-[11px] text-slate-500">
                        برای این درخواست قبلاً Refund ثبت شده است.
                    </div>
                ) : null}
            </div>
        </div>
    );
}
