"use client";

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { listProductsByCategory } from "@/modules/compare/api";
import { resolveMediaUrl } from "@/modules/media/resolve-url";

function toFaNumber(n: number) {
    return Number(n || 0).toLocaleString("fa-IR");
}

export default function ComparePickModal({
    open,
    onClose,
    categoryId,
    selectedIds,
    onPick,
}: {
    open: boolean;
    onClose: () => void;
    categoryId: string;
    selectedIds: string[];
    onPick: (productId: string) => void;
}) {
    const [q, setQ] = useState("");
    const [debouncedQ, setDebouncedQ] = useState("");

    useEffect(() => {
        if (!open) return;
        const t = window.setTimeout(() => setDebouncedQ(q.trim()), 250);
        return () => window.clearTimeout(t);
    }, [q, open]);

    useEffect(() => {
        if (!open) {
            setQ("");
            setDebouncedQ("");
        }
    }, [open]);

    const inf = useInfiniteQuery({
        queryKey: ["compare", "pick", categoryId, debouncedQ],
        enabled: open && !!categoryId,
        queryFn: async ({ pageParam }) => {
            const page = Number(pageParam ?? 1);
            return listProductsByCategory({
                categoryId,
                page,
                pageSize: 12,
                q: debouncedQ || undefined,
            });
        },
        initialPageParam: 1,
        getNextPageParam: (last) => {
            const totalPages = Math.ceil((last.totalCount ?? 0) / (last.pageSize ?? 12));
            return last.page < totalPages ? last.page + 1 : undefined;
        },
    });

    const items = useMemo(() => {
        return (inf.data?.pages ?? []).flatMap((p) => p.items ?? []);
    }, [inf.data]);

    const totalCount = inf.data?.pages?.[0]?.totalCount ?? 0;

    const sentinelRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (!open) return;
        const el = sentinelRef.current;
        if (!el) return;

        const io = new IntersectionObserver((entries) => {
            const e = entries[0];
            if (e.isIntersecting && inf.hasNextPage && !inf.isFetchingNextPage) {
                inf.fetchNextPage();
            }
        }, { rootMargin: "200px" });

        io.observe(el);
        return () => io.disconnect();
    }, [open, inf.hasNextPage, inf.isFetchingNextPage, inf.fetchNextPage]);

    if (!open) return null;

    return (
        <Dialog open={open} onClose={onClose} className="relative z-[999999]">
            <DialogBackdrop className="fixed inset-0 bg-black/40" />

            <div className="fixed inset-0 flex items-center justify-center p-4" dir="rtl" lang="fa">
                <DialogPanel className="w-full max-w-[980px] rounded-2xl bg-white shadow-xl border border-[var(--color-neutral-200)] overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4">
                        <DialogTitle className="text-h5-regular-180 text-neutral-900">
                            انتخاب کالا برای مقایسه
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

                    <div className="px-5 py-4">
                        <div className="relative">
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="جستجو در کالاها..."
                                className="w-full rounded-xl border border-[var(--color-neutral-200)] bg-white px-4 py-3 pr-12 text-body-2 outline-none focus:ring-2 focus:ring-[var(--color-secondary-500)]"
                            />
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        </div>

                        <div className="mt-3 flex items-center justify-between text-body-2 text-neutral-500 [font-family:var(--font-iransans)]">
                            <div>{toFaNumber(totalCount)} کالا</div>
                            <div>برترین کالاها برای مقایسه</div>
                        </div>
                    </div>

                    <div className="h-px bg-[var(--color-neutral-200)]" />

                    <div className="max-h-[520px] overflow-y-auto px-5 py-4">
                        {inf.isLoading ? (
                            <div className="py-10 text-body-2 text-neutral-500">در حال بارگذاری…</div>
                        ) : items.length === 0 ? (
                            <div className="py-10 text-body-2 text-neutral-500">موردی یافت نشد.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {items.map((p) => {
                                    const disabled = selectedIds.includes(p.id);
                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            disabled={disabled}
                                            onClick={() => onPick(p.id)}
                                            className={
                                                "w-full rounded-2xl border border-[var(--color-neutral-200)] bg-white p-4 text-right hover:bg-[var(--color-neutral-100)] disabled:opacity-50 disabled:cursor-not-allowed"
                                            }
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-[140px] w-[140px] shrink-0 grid place-items-center">
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

                                                <div className="min-w-0 flex-1">
                                                    <div className="text-body1-strong text-neutral-900 line-clamp-2">
                                                        {p.title}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <div ref={sentinelRef} className="h-1" />

                        {inf.isFetchingNextPage && (
                            <div className="py-4 text-body-2 text-neutral-500">در حال دریافت موارد بیشتر…</div>
                        )}
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}