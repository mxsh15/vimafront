"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminVendorOfferDetailDto } from "../types";
import {
    approveOfferAction,
    rejectOfferAction,
    disableOfferAction,
    enableOfferAction,
    deleteOfferAction,
    restoreOfferAction,
    hardDeleteOfferAction,
} from "../actions";

export function OfferDetailActions({
    offerId,
    current,
}: {
    offerId: string;
    current: AdminVendorOfferDetailDto;
}) {
    const router = useRouter();
    const [notes, setNotes] = useState<string>("");

    const status = typeof (current as any).status === "number"
        ? (Number((current as any).status) === 0 ? "Pending" :
            Number((current as any).status) === 1 ? "Approved" :
                Number((current as any).status) === 2 ? "Rejected" :
                    "Disabled")
        : (current as any).status;

    const canApprove = !current.isDeleted && status !== "Approved";
    const canReject = !current.isDeleted && status !== "Rejected";
    const canDisable = !current.isDeleted && status !== "Disabled";
    const canEnableToPending = !current.isDeleted && status !== "Pending";

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold text-slate-700">عملیات</div>

            <div className="mt-2">
                <label className="block text-[11px] text-slate-500">یادداشت (اختیاری)</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none"
                    rows={3}
                    placeholder="مثلاً: قیمت غیرواقعی بود..."
                />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                <button
                    type="button"
                    disabled={!canApprove}
                    onClick={async () => {
                        const ok = window.confirm("این پیشنهاد تایید شود؟");
                        if (!ok) return;
                        await approveOfferAction(offerId, current.rowVersion, notes || undefined);
                        router.refresh();
                    }}
                    className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-[11px] font-medium text-emerald-700 disabled:opacity-50"
                >
                    تایید
                </button>

                <button
                    type="button"
                    disabled={!canReject}
                    onClick={async () => {
                        const ok = window.confirm("این پیشنهاد رد شود؟");
                        if (!ok) return;
                        await rejectOfferAction(offerId, notes || undefined);
                        router.refresh();
                    }}
                    className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-[11px] font-medium text-rose-700 disabled:opacity-50"
                >
                    رد
                </button>

                <button
                    type="button"
                    disabled={!canDisable}
                    onClick={async () => {
                        const ok = window.confirm("این پیشنهاد غیرفعال شود؟");
                        if (!ok) return;
                        await disableOfferAction(offerId, notes || undefined);
                        router.refresh();
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-700 disabled:opacity-50"
                >
                    غیرفعال
                </button>

                <button
                    type="button"
                    disabled={!canEnableToPending}
                    onClick={async () => {
                        const ok = window.confirm("به وضعیت Pending برگردد؟");
                        if (!ok) return;
                        await enableOfferAction(offerId, notes || undefined);
                        router.refresh();
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-700 disabled:opacity-50"
                >
                    Pending
                </button>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-3">
                <div className="text-[11px] font-semibold text-slate-700">حذف / بازیابی</div>

                {!current.isDeleted ? (
                    <button
                        type="button"
                        onClick={async () => {
                            const ok = window.confirm("این پیشنهاد حذف (Soft) شود؟");
                            if (!ok) return;
                            await deleteOfferAction(offerId);
                            router.refresh();
                        }}
                        className="mt-2 w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-[11px] font-medium text-rose-700"
                    >
                        حذف (Soft)
                    </button>
                ) : (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={async () => {
                                const ok = window.confirm("این پیشنهاد بازیابی شود؟");
                                if (!ok) return;
                                await restoreOfferAction(offerId);
                                router.refresh();
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-700"
                        >
                            بازیابی
                        </button>

                        <button
                            type="button"
                            onClick={async () => {
                                const ok = window.confirm(
                                    "حذف دائمی انجام شود؟ این عملیات برگشت‌پذیر نیست."
                                );
                                if (!ok) return;
                                await hardDeleteOfferAction(offerId);
                                router.push("/admin/vendor-offers/trash");
                            }}
                            className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-[11px] font-medium text-rose-700"
                        >
                            حذف دائمی
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
