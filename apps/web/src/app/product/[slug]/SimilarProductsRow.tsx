"use client";

import Link from "next/link";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import { usePublicCategoryProducts } from "@/modules/product/hooks";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";
import { useEffect, useMemo, useRef, useState } from "react";

function hasValidPrice(n: unknown): n is number {
    return typeof n === "number" && isFinite(n) && n > 0;
}

function toFaNumber(n?: number | null) {
    if (!n || n <= 0) return "";
    return Number(n).toLocaleString("fa-IR");
}

function truncateWords(text: string, maxWords: number) {
    if (!text) return "";
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "…";
}

export default function SimilarProductsRow({
    categoryIds,
    excludeProductId,
}: {
    categoryIds?: string[] | null;
    excludeProductId?: string | null;
}) {
    const ids = (categoryIds ?? []).filter(Boolean);
    const q = usePublicCategoryProducts({ take: 18, categoryIds: ids });
    const items = q.data ?? [];

    // 1) حذف خود محصول از لیست مشابه‌ها
    const filteredItems = useMemo(() => {
        if (!excludeProductId) return items;
        return items.filter((p: any) => p?.id !== excludeProductId);
    }, [items, excludeProductId]);

    const [isLgUp, setIsLgUp] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(min-width: 1024px)");
        const onChange = () => setIsLgUp(mq.matches);
        onChange();
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    // navigation refs
    const prevRef = useRef<HTMLButtonElement | null>(null);
    const nextRef = useRef<HTMLButtonElement | null>(null);

    const [atStart, setAtStart] = useState(true);
    const [atEnd, setAtEnd] = useState(false);

    // اگر آیتم‌ها کمتر/مساوی تعداد نمایشی باشند، nav لازم نیست
    const shouldShowNav = useMemo(() => {
        if (!filteredItems?.length) return false;
        const perView = isLgUp ? 7 : 1;
        return isLgUp ? filteredItems.length > perView : filteredItems.length > 1;
    }, [filteredItems?.length, isLgUp]);

    if (!ids.length) return null;

    return (
        <>
            {q.isFetching ? (
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                    <div className="text-xs text-slate-500">در حال بارگذاری...</div>
                </div>
            ) : null}

            {filteredItems.length === 0 ? (
                <div className="p-4 text-sm text-slate-600">موردی برای نمایش وجود ندارد.</div>
            ) : (
                <div className="relative">
                    {/* دکمه‌ها */}
                    {shouldShowNav ? (
                        <>
                            {/* در RTL: prev یعنی رفتن به سمت راست (به ابتدای لیست) */}
                            <button
                                ref={prevRef}
                                type="button"
                                aria-label="قبلی"
                                className={[
                                    "absolute right-2 top-1/2 -translate-y-1/2 z-10",
                                    "h-9 w-9 rounded-full bg-white/95 border border-slate-200 shadow",
                                    "flex items-center justify-center select-none",
                                    atStart ? "hidden" : "",
                                ].join(" ")}
                            >
                                <svg viewBox="0 0 24 24" className="h-5 w-5">
                                    <path d="M10 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </button>

                            {/* در RTL: next یعنی رفتن به سمت چپ (به انتهای لیست) */}
                            <button
                                ref={nextRef}
                                type="button"
                                aria-label="بعدی"
                                className={[
                                    "absolute left-2 top-1/2 -translate-y-1/2 z-10",
                                    "h-9 w-9 rounded-full bg-white/95 border border-slate-200 shadow",
                                    "flex items-center justify-center select-none",
                                    atEnd ? "hidden" : "",
                                ].join(" ")}
                            >
                                <svg viewBox="0 0 24 24" className="h-5 w-5">
                                    <path d="M14 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </button>
                        </>
                    ) : null}

                    <Swiper
                        className="swiper swiper-horizontal swiper-rtl"
                        dir="rtl"
                        modules={[FreeMode, Navigation]}
                        freeMode={isLgUp ? { enabled: false } : { enabled: true }}
                        slidesPerView={isLgUp ? 7 : "auto"}
                        spaceBetween={isLgUp ? 16 : 24}
                        watchOverflow
                        onBeforeInit={(swiper) => {
                            // @ts-ignore
                            swiper.params.navigation = {
                                prevEl: prevRef.current,
                                nextEl: nextRef.current,
                                disabledClass: "swiper-button-disabled",
                            };
                        }}
                        onInit={(swiper) => {
                            setAtStart(swiper.isBeginning);
                            setAtEnd(swiper.isEnd);
                            if (swiper.navigation) {
                                swiper.navigation.init();
                                swiper.navigation.update();
                            }
                        }}
                        onSlideChange={(swiper) => {
                            setAtStart(swiper.isBeginning);
                            setAtEnd(swiper.isEnd);
                        }}
                        onReachBeginning={() => setAtStart(true)}
                        onReachEnd={() => setAtEnd(true)}
                        onFromEdge={(swiper) => {
                            setAtStart(swiper.isBeginning);
                            setAtEnd(swiper.isEnd);
                        }}
                    >
                        {filteredItems.map((p: any) => {
                            // 2) فیلدهای درست API شما:
                            const price = p.price as number | null;
                            const oldPrice = p.oldPrice as number | null;

                            const hasPrice = hasValidPrice(price);
                            const hasOldPrice = hasValidPrice(oldPrice);

                            const derivedPercent =
                                hasOldPrice && hasPrice && oldPrice! > price!
                                    ? Math.round(((oldPrice! - price!) / oldPrice!) * 100)
                                    : 0;

                            const discountPercent =
                                typeof p.discountPercent === "number" &&
                                    isFinite(p.discountPercent) &&
                                    p.discountPercent > 0
                                    ? Math.round(p.discountPercent)
                                    : derivedPercent;

                            const hasDiscount =
                                hasPrice &&
                                (hasOldPrice ? oldPrice! > price! : discountPercent > 0) &&
                                discountPercent > 0;

                            const finalPrice = hasPrice ? price! : null;

                            return (
                                <SwiperSlide key={p.id} className="!w-[172px] sm:!w-[190px] lg:!w-auto">
                                    <Link
                                        href={`/product/${p.slug}`}
                                        data-cro-id="related-products"
                                        className="block cursor-pointer relative bg-neutral-000 overflow-hidden grow py-3 px-4 lg:px-2 h-full border-l border-l-[var(--color-neutral-100)]"
                                    >
                                        <div data-testid="product-card" className="h-full">
                                            <article className="overflow-hidden flex flex-col items-stretch justify-start h-full">
                                                <div className="flex grow relative flex-col">
                                                    <div className="flex items-stretch flex-col relative mb-1">
                                                        <div className="flex items-start mx-auto">
                                                            <div className="mx-auto w-[150px] h-[150px]">
                                                                {p.imageUrl ? (
                                                                    <img
                                                                        className="w-full h-full object-contain rounded-[var(--radius-global)]"
                                                                        src={resolveMediaUrl(p.imageUrl)}
                                                                        alt={p.title}
                                                                        loading="lazy"
                                                                        draggable={false}
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full rounded-[var(--radius-global)] bg-slate-50 border border-slate-200" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grow flex flex-col items-stretch justify-start">
                                                        <h3 className="text-body2-strong text-neutral-700 leading-6 min-h-[48px]">
                                                            {truncateWords(p.title, 5)}
                                                        </h3>

                                                        <div className="pt-1 flex flex-col items-stretch justify-between">
                                                            <div className="flex items-center justify-between">
                                                                {hasDiscount && (
                                                                    <div className="px-1 text-white rounded-lg flex items-center justify-center bg-[var(--color-hint-object-error)] w-[34px] h-[20px]">
                                                                        <span className="text-body2-strong">
                                                                            {discountPercent.toLocaleString("fa-IR")}%
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                <div className="flex items-center justify-end gap-1 text-neutral-700 text-h5 grow">
                                                                    {finalPrice ? (
                                                                        <>
                                                                            <span>{toFaNumber(finalPrice)}</span>
                                                                            <span>تومان</span>
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-neutral-500 text-body2-strong">
                                                                            تماس بگیرید
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between pl-5">
                                                                {hasDiscount && hasOldPrice && (
                                                                    <div className="text-neutral-300 line-through self-end mr-auto text-body-2">
                                                                        {toFaNumber(oldPrice)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        </div>
                                    </Link>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                </div>
            )}
        </>
    );
}
