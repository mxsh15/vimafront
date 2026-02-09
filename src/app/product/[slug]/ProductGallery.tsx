"use client";

import { useMemo, useState } from "react";
import { resolveMediaUrl } from "@/modules/media/resolve-url";

export default function ProductGallery({
    title,
    primaryImageUrl,
    galleryImageUrls,
}: {
    title: string;
    primaryImageUrl?: string | null;
    galleryImageUrls?: string[] | null;
}) {
    const images = useMemo(() => {
        const list = (galleryImageUrls ?? []).filter(Boolean);
        const primary = primaryImageUrl ? [primaryImageUrl] : [];
        const merged = [...primary, ...list].filter(Boolean);
        return Array.from(new Set(merged));
    }, [primaryImageUrl, galleryImageUrls]);

    const [active, setActive] = useState(0);
    const src = images[active] ?? images[0] ?? null;

    return (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-soft">
            <div className="p-4">
                <div className="aspect-square rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
                    {src ? (
                        <img
                            src={resolveMediaUrl(src)}
                            alt={title}
                            className="h-full w-full object-contain"
                            loading="eager"
                        />
                    ) : (
                        <div className="text-sm text-slate-500">تصویر محصول موجود نیست</div>
                    )}
                </div>

                {images.length > 1 ? (
                    <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                        {images.slice(0, 10).map((u, i) => (
                            <button
                                key={u}
                                type="button"
                                onClick={() => setActive(i)}
                                className={
                                    "h-16 w-16 shrink-0 rounded-xl border overflow-hidden bg-white " +
                                    (i === active
                                        ? "border-brand-600 ring-2 ring-brand-100"
                                        : "border-slate-200 hover:border-slate-300")
                                }
                                aria-label={`تصویر ${i + 1}`}
                            >
                                <img
                                    src={resolveMediaUrl(u)}
                                    alt={title}
                                    className="h-full w-full object-contain"
                                />
                            </button>
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
