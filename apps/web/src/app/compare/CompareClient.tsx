"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCompareData } from "@/modules/compare/api";
import {
    addToCompare,
    loadCompareState,
    removeFromCompare,
    clearCompareState,
    type CompareState,
} from "@/modules/compare/storage";
import ComparePickModal from "./ComparePickModal";
import { resolveMediaUrl } from "@/modules/media/resolve-url";

function toFaNumber(n: number) {
    return Number(n || 0).toLocaleString("fa-IR");
}

export default function CompareClient() {
    const [state, setState] = useState<CompareState>({ categoryId: null, productIds: [] });
    const [pickOpen, setPickOpen] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    useEffect(() => {
        setState(loadCompareState());
    }, []);

    const q = useQuery({
        queryKey: ["compare", "data", state.productIds.join(",")],
        queryFn: () => getCompareData(state.productIds),
        enabled: state.productIds.length > 0,
    });

    const products = q.data?.products ?? [];
    const sections = q.data?.sections ?? [];

    const columns = useMemo(() => {
        const cols = new Array(4).fill(null).map((_, i) => products[i] ?? null);
        return cols;
    }, [products]);

    const openPicker = () => {
        if (!state.categoryId) {
            setNotice("برای مقایسه، ابتدا یک کالا از صفحه محصول اضافه کنید.");
            window.setTimeout(() => setNotice(null), 2500);
            return;
        }
        setPickOpen(true);
    };

    const onPick = (productId: string) => {
        if (!state.categoryId) return;

        const r = addToCompare(productId, state.categoryId);
        setState(r.state);

        if (r.action === "full") {
            setNotice("حداکثر ۴ کالا قابل مقایسه است.");
            window.setTimeout(() => setNotice(null), 2500);
            return;
        }

        setPickOpen(false);
    };

    const onRemove = (productId: string) => {
        const r = removeFromCompare(productId);

        if (r.blocked) {
            setNotice("کالای اصلی مقایسه قابل حذف نیست.");
            window.setTimeout(() => setNotice(null), 2500);
            return;
        }

        setState(r.state);
    };

    return (
        <div className="mx-auto max-w-main px-4 lg:px-5 py-6" dir="rtl" lang="fa">
            {notice && (
                <div className="mb-4 rounded-xl border border-[var(--color-neutral-200)] bg-white px-4 py-3 text-body-2 text-neutral-700">
                    {notice}
                </div>
            )}

            <h1 className="text-h4 text-neutral-900 mb-4">مقایسه کالاها</h1>

            {/* Header grid */}
            <div className="rounded-2xl border border-[var(--color-neutral-200)] bg-white overflow-hidden">
                <div className="grid grid-cols-[220px_repeat(4,minmax(0,1fr))] border-b border-[var(--color-neutral-200)]">
                    <div className="p-4 text-body-2 text-neutral-500">
                        {state.productIds.length ? `${toFaNumber(state.productIds.length)} / ۴ کالا` : ""}
                    </div>

                    {columns.map((p, idx) => (
                        <div key={idx} className="p-4 border-r border-[var(--color-neutral-200)] first:border-r-0">
                            {p ? (
                                <div className="relative">
                                    {state.baseProductId !== p.id && (
                                        <button
                                            type="button"
                                            onClick={() => onRemove(p.id)}
                                            className="absolute -top-2 -right-2 grid h-8 w-8 place-items-center rounded-full bg-white border border-[var(--color-neutral-200)] text-neutral-500 hover:bg-[var(--color-neutral-100)]"
                                            aria-label="حذف از مقایسه"
                                            title="حذف"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}

                                    <Link href={`/product/${encodeURIComponent(p.slug)}`} className="block">
                                        <div className="h-[140px] w-full grid place-items-center">
                                            {p.primaryImageUrl ? (
                                                <img
                                                    src={resolveMediaUrl(p.primaryImageUrl)}
                                                    alt={p.title}
                                                    className="h-[140px] w-[140px] object-contain"
                                                />
                                            ) : (
                                                <div className="h-[140px] w-[140px] rounded-xl bg-[var(--color-neutral-100)]" />
                                            )}
                                        </div>
                                        <div className="mt-3 text-body-2 text-neutral-900 line-clamp-2">
                                            {p.title}
                                        </div>
                                    </Link>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={openPicker}
                                    className="w-full rounded-xl border border-[var(--color-button-primary)] text-[var(--color-button-primary)] px-4 py-2 text-body-2 hover:bg-[rgba(230,18,61,0.06)]"
                                >
                                    انتخاب کالا
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Specs */}
                <div className="overflow-x-auto">
                    {q.isLoading ? (
                        <div className="p-6 text-body-2 text-neutral-500">در حال بارگذاری…</div>
                    ) : sections.length === 0 ? (
                        <div className="p-6 text-body-2 text-neutral-500">
                            هنوز مشخصات قابل مقایسه‌ای برای نمایش وجود ندارد (ویژگی‌ها باید IsComparable باشند).
                        </div>
                    ) : (
                        <div className="min-w-[1000px]">
                            {sections.map((sec) => (
                                <div key={sec.title} className="border-t border-[var(--color-neutral-200)]">
                                    <div className="bg-[var(--color-neutral-100)] px-4 py-3 text-body2-strong text-neutral-900">
                                        {sec.title}
                                    </div>

                                    {sec.rows.map((row, rIdx) => (
                                        <div
                                            key={row.title + rIdx}
                                            className="grid grid-cols-[220px_repeat(4,minmax(0,1fr))] border-t border-[var(--color-neutral-200)]"
                                        >
                                            <div className="px-4 py-3 text-body-2 text-neutral-700">
                                                {row.title}
                                                {row.unit ? <span className="text-neutral-400"> ({row.unit})</span> : null}
                                            </div>

                                            {new Array(4).fill(null).map((_, i) => {
                                                const v = row.values?.[i] ?? null;
                                                return (
                                                    <div
                                                        key={i}
                                                        className="px-4 py-3 text-body-2 text-neutral-900 border-r border-[var(--color-neutral-200)] first:border-r-0"
                                                    >
                                                        {v ?? "—"}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {state.categoryId && (
                <ComparePickModal
                    open={pickOpen}
                    onClose={() => setPickOpen(false)}
                    categoryId={state.categoryId}
                    selectedIds={state.productIds}
                    onPick={onPick}
                />
            )}
        </div>
    );
}