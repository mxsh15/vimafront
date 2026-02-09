"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProductQuestionDetailDto, ProductAnswerAdminDto } from "@/modules/product-qa/types";
import {
    verifyAnswerAction,
    updateAnswerAction,
    deleteAnswerAction,
} from "@/modules/product-qa/actions";

export function QuestionDetailClient({ data }: { data: ProductQuestionDetailDto }) {
    const router = useRouter();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState("");

    const startEdit = (a: ProductAnswerAdminDto) => {
        setEditingId(a.id);
        setEditingValue(a.answer);
    };

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold">سؤال</div>
                <div className="mt-2 text-xs text-slate-700 space-y-1">
                    <div>محصول: <span className="font-medium">{data.productTitle}</span></div>
                    <div>کاربر: {data.userFullName}</div>
                    <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                        {data.question}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold">پاسخ‌ها</div>

                <div className="mt-2 space-y-3">
                    {data.answers.map((a) => (
                        <div key={a.id} className="rounded-2xl border border-slate-200 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="text-[11px] text-slate-500">
                                    {a.vendorName ? `Vendor: ${a.vendorName}` : a.userFullName ? `User: ${a.userFullName}` : "—"}
                                    {" · "}
                                    {new Date(a.createdAtUtc).toLocaleString("fa-IR")}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        className={
                                            "rounded-xl border px-2 py-1 text-[11px] " +
                                            (a.isVerified
                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                : "border-amber-200 bg-amber-50 text-amber-700")
                                        }
                                        onClick={async () => {
                                            await verifyAnswerAction(a.id, !a.isVerified);
                                            router.refresh();
                                        }}
                                    >
                                        {a.isVerified ? "تایید شده" : "نیاز به تایید"}
                                    </button>

                                    <button
                                        className="rounded-xl border border-slate-200 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
                                        onClick={() => startEdit(a)}
                                    >
                                        ویرایش
                                    </button>

                                    <button
                                        className="rounded-xl border border-rose-200 px-2 py-1 text-[11px] text-rose-700 hover:bg-rose-50"
                                        onClick={async () => {
                                            const ok = window.confirm("این پاسخ حذف شود؟");
                                            if (!ok) return;
                                            await deleteAnswerAction(a.id);
                                            router.refresh();
                                        }}
                                    >
                                        حذف
                                    </button>
                                </div>
                            </div>

                            {editingId === a.id ? (
                                <div className="mt-2 space-y-2">
                                    <textarea
                                        className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                                        rows={4}
                                        value={editingValue}
                                        onChange={(e) => setEditingValue(e.target.value)}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs"
                                            onClick={() => setEditingId(null)}
                                        >
                                            انصراف
                                        </button>
                                        <button
                                            className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs text-white"
                                            onClick={async () => {
                                                if (!editingValue.trim()) return;
                                                await updateAnswerAction(a.id, editingValue.trim());
                                                setEditingId(null);
                                                router.refresh();
                                            }}
                                        >
                                            ذخیره
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-2 text-xs text-slate-700">{a.answer}</div>
                            )}
                        </div>
                    ))}

                    {!data.answers.length ? (
                        <div className="text-xs text-slate-500">هنوز پاسخی ثبت نشده است.</div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
