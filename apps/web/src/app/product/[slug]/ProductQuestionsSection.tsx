"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

type PublicProductQuestionDto = {
    id: string;
    productId: string;
    productTitle: string;
    userId: string;
    userFullName: string;
    question: string;
    isAnswered: boolean;
    answersCount: number;
    createdAtUtc: string;
};

function toFaDate(s: string) {
    try {
        return new Date(s).toLocaleDateString("fa-IR");
    } catch {
        return "";
    }
}

async function listPublicQuestions(productId: string) {
    return apiFetch<PublicProductQuestionDto[]>(
        `product-questions/by-product/${productId}`,
        { method: "GET" }
    );
}

export default function ProductQuestionsSection({
    productId,
}: {
    productId: string;
}) {
    const q = useQuery({
        queryKey: ["public-product-questions", productId] as const,
        queryFn: () => listPublicQuestions(productId),
    });

    const items = q.data ?? [];

    return (
        <section id="qa" className="rounded-2xl bg-white border border-slate-200 shadow-soft">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <div className="text-sm font-semibold">پرسش‌ها</div>
                <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
                    title="ثبت پرسش عمومی در فرانت هنوز پیاده‌سازی نشده"
                    disabled
                >
                    ثبت پرسش
                </button>
            </div>

            {q.isLoading ? (
                <div className="p-4 text-sm text-slate-600">در حال بارگذاری...</div>
            ) : items.length === 0 ? (
                <div className="p-4 text-sm text-slate-600">
                    هنوز پرسشی برای این کالا ثبت نشده است.
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {items.slice(0, 8).map((it) => (
                        <div key={it.id} className="p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="text-xs text-slate-500">
                                    {it.userFullName} • {toFaDate(it.createdAtUtc)}
                                </div>
                                {it.isAnswered ? (
                                    <span className="text-xs rounded-full bg-emerald-50 text-emerald-700 px-2 py-1">
                                        پاسخ داده شده
                                    </span>
                                ) : (
                                    <span className="text-xs rounded-full bg-slate-100 text-slate-600 px-2 py-1">
                                        در انتظار پاسخ
                                    </span>
                                )}
                            </div>
                            <div className="mt-2 text-sm leading-7">{it.question}</div>
                            <div className="mt-2 text-xs text-slate-500">
                                تعداد پاسخ: {it.answersCount.toLocaleString("fa-IR")}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
