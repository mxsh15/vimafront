"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
    Info,
    Heart,
    Share2,
    Bell,
    BarChart3,
    GitCompare,
    List,
} from "lucide-react";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import ProductGalleryModal from "./ProductGalleryModal";

type ProductGallerySideProps = {
    title?: string;
    mainImageUrl: string | null | undefined;
    thumbs?: string[] | null | undefined;
    sku?: string | null;
    onReportClick?: () => void;
};

function uniq(arr: string[]) {
    return Array.from(new Set((arr ?? []).filter(Boolean)));
}

export function ProductGallerySide({
    title = "تصویر محصول",
    mainImageUrl,
    thumbs = [],
    sku,
    onReportClick,
}: ProductGallerySideProps) {
    const images = useMemo(() => {
        const primary = mainImageUrl ? [mainImageUrl] : [];
        const merged = [...primary, ...(thumbs ?? [])].filter(Boolean) as string[];
        return uniq(merged);
    }, [mainImageUrl, thumbs]);

    const [active, setActive] = useState(0);
    const activeSrc = images[active] ?? images[0] ?? null;

    const [open, setOpen] = useState(false);

    const openAt = (idx: number) => {
        const next = Math.max(0, Math.min(images.length - 1, idx));
        setActive(next);
        setOpen(true);
    };

    return (
        <div className="lg:ml-4 shrink-0 flex flex-col-reverse lg:flex-col">
            <div className="flex flex-col items-center lg:max-w-[368px] xl:max-w-[580px] lg:block">
                <div className="flex relative w-full">
                    {/* ستون آیکن‌ها */}
                    <div className="flex lg:flex-col lg:gap-y-4 text-neutral-700 self-end lg:self-start lg:text-neutral-900">
                        <IconButton title="افزودن به علاقه‌مندی">
                            <Heart className="h-6 w-6" />
                        </IconButton>
                        <IconButton title="اشتراک‌گذاری">
                            <Share2 className="h-6 w-6" />
                        </IconButton>
                        <IconButton title="اطلاع‌رسانی">
                            <Bell className="h-6 w-6" />
                        </IconButton>
                        <IconButton title="نمودار قیمت">
                            <BarChart3 className="h-6 w-6" />
                        </IconButton>
                        <IconButton title="مقایسه">
                            <GitCompare className="h-6 w-6" />
                        </IconButton>
                        <IconButton title="افزودن به لیست">
                            <List className="h-6 w-6" />
                        </IconButton>
                    </div>

                    {/* تصویر اصلی */}
                    <div className="relative flex items-center w-full">
                        <button
                            type="button"
                            className="cursor-pointer w-full"
                            aria-label="مشاهده تصویر محصول"
                            style={{ lineHeight: 0 }}
                            onClick={() => {
                                if (!activeSrc) return;
                                openAt(active);
                            }}
                        >
                            {activeSrc ? (
                                <Image
                                    src={resolveMediaUrl(activeSrc)}
                                    alt={title}
                                    width={800}
                                    height={800}
                                    className="w-full rounded-2xl overflow-hidden inline-block object-contain"
                                    priority
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full aspect-square rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-sm text-slate-500">
                                    تصویر محصول موجود نیست
                                </div>
                            )}
                        </button>
                    </div>
                </div>

                {/* بندانگشتی‌ها */}
                {images.length > 1 && (
                    <div className="flex items-center mt-5 mb-3 w-full overflow-x-auto no-scrollbar">
                        {images.slice(0, 10).map((u, idx) => {
                            const isActive = idx === active;
                            return (
                                <button
                                    key={`${u}-${idx}`}
                                    type="button"
                                    onClick={() => openAt(idx)} // ✅ کلیک thumbnail → مودال باز شود و همان تصویر
                                    className={
                                        "cursor-pointer rounded border p-1 ml-2 shrink-0 " +
                                        (isActive
                                            ? "border-brand-600 ring-2 ring-brand-100"
                                            : "border-neutral-200 hover:border-neutral-300")
                                    }
                                    aria-label={`تصویر ${idx + 1}`}
                                    style={{ lineHeight: 0 }}
                                >
                                    <Image
                                        src={resolveMediaUrl(u)}
                                        alt={`تصویر ${idx + 1}`}
                                        width={72}
                                        height={72}
                                        className="inline-block object-contain"
                                        unoptimized
                                    />
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className="hidden lg:flex items-center w-full">
                    <button
                        type="button"
                        onClick={onReportClick}
                        className="rounded cursor-pointer ml-9 flex items-center"
                    >
                        <Info className="h-[18px] w-[18px] text-neutral-400" />
                        <span className="mr-2 text-[12px] leading-5 text-neutral-500">
                            گزارش مشخصات کالا یا موارد قانونی
                        </span>
                    </button>

                    <span className="text-[11px] leading-5 text-neutral-400">
                        {sku ? ` ${sku}` : ""}
                    </span>
                </div>
            </div>

            {/* مودال */}
            <ProductGalleryModal
                open={open}
                onClose={() => setOpen(false)}
                title={title}
                images={images}
                initialIndex={active}
            />
        </div>
    );
}

function IconButton({ children, title }: { children: React.ReactNode; title: string }) {
    return (
        <button type="button" title={title} className="z-[1] whitespace-nowrap ml-6 lg:ml-4">
            <span className="flex cursor-pointer ml-5 lg:ml-0">{children}</span>
        </button>
    );
}
