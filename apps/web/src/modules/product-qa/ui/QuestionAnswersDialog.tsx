"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import { getQuestionDetail } from "../api";
import type { ProductQuestionDetailDto } from "../types";

type Props = {
    open: boolean;
    onClose: () => void;
    questionId: string;
    productTitle: string;
    questionText: string;
};

function toFaDateTime(iso: string) {
    try {
        return new Date(iso).toLocaleString("fa-IR", {
            dateStyle: "short",
            timeStyle: "short",
        });
    } catch {
        return iso;
    }
}

export function QuestionAnswersDialog({
    open,
    onClose,
    questionId,
    productTitle,
    questionText,
}: Props) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ProductQuestionDetailDto | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;

        let cancelled = false;
        setLoading(true);
        setErr(null);

        getQuestionDetail(questionId)
            .then((res) => {
                if (cancelled) return;
                setData(res);
            })
            .catch((e) => {
                if (cancelled) return;
                setErr(
                    typeof e?.message === "string" ? e.message : "خطا در دریافت پاسخ‌ها"
                );
            })
            .finally(() => {
                if (cancelled) return;
                setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [open, questionId]);

    const answers = useMemo(() => data?.answers ?? [], [data]);

    return (
        <Dialog open={open} onClose={onClose} className="relative z-50">
            <DialogBackdrop className="fixed inset-0 bg-black/30" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="w-full max-w-2xl rounded-2xl bg-white p-4 shadow-lg">
                    <DialogTitle className="mb-1 text-sm font-semibold">
                        پاسخ‌های پرسش محصول «{productTitle}»
                    </DialogTitle>

                    <p className="mb-3 text-xs text-slate-600">{questionText}</p>

                    {loading ? (
                        <div className="rounded-xl border border-slate-200 p-4 text-xs text-slate-500">
                            در حال دریافت پاسخ‌ها...
                        </div>
                    ) : err ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                            {err}
                        </div>
                    ) : answers.length === 0 ? (
                        <div className="rounded-xl border border-slate-200 p-4 text-xs text-slate-500">
                            پاسخی برای این پرسش ثبت نشده است.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {answers.map((a) => (
                                <div
                                    key={a.id}
                                    className="rounded-xl border border-slate-200 p-3"
                                >
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-semibold text-slate-800">
                                            {a.userFullName ?? "—"}
                                        </span>

                                        {a.vendorName ? (
                                            <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] text-slate-600">
                                                فروشنده: {a.vendorName}
                                            </span>
                                        ) : null}

                                        <span className="mr-auto text-[10px] text-slate-400">
                                            {toFaDateTime(a.createdAtUtc)}
                                        </span>
                                    </div>

                                    <p className="mt-2 whitespace-pre-wrap text-xs text-slate-700">
                                        {a.answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-4 flex justify-end">
                        <button
                            type="button"
                            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs"
                            onClick={onClose}
                        >
                            بستن
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
