"use client";

import Link from "next/link";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import { usePublicCategoryProducts } from "@/modules/product/hooks";

function toFaMoney(n?: number | null) {
    if (!n || n <= 0) return "تماس بگیرید";
    return `${Number(n).toLocaleString("fa-IR")} تومان`;
}

export default function SimilarProductsRow({
    categoryIds,
}: {
    categoryIds?: string[] | null;
}) {
    const ids = (categoryIds ?? []).filter(Boolean);
    const q = usePublicCategoryProducts({ take: 18, categoryIds: ids });
    const items = q.data ?? [];

    if (!ids.length) return null;

    return (
        <section className="rounded-2xl bg-white border border-slate-200 shadow-soft">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <div className="text-sm font-semibold">کالاهای مشابه</div>
                {q.isFetching ? (
                    <div className="text-xs text-slate-500">در حال بارگذاری...</div>
                ) : null}
            </div>

            {items.length === 0 ? (
                <div className="p-4 text-sm text-slate-600">
                    موردی برای نمایش وجود ندارد.
                </div>
            ) : (
                <div className="p-4">
                    <div className="flex gap-3 overflow-x-auto no-scrollbar">
                        {items.map((p) => (
                            <Link
                                key={p.id}
                                href={`/product/${p.slug}`}
                                className="w-[176px] shrink-0 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition"
                            >
                                <div className="p-3">
                                    <div className="h-36 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
                                        {p.imageUrl ? (
                                            <img
                                                src={resolveMediaUrl(p.imageUrl)}
                                                alt={p.title}
                                                className="h-full w-full object-contain"
                                                loading="lazy"
                                            />
                                        ) : null}
                                    </div>
                                    <div className="mt-2 text-xs font-semibold line-clamp-2 min-h-[2.5rem]">
                                        {p.title}
                                    </div>
                                    <div className="mt-2 text-sm font-bold">{toFaMoney(p.price)}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
