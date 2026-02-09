"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/free-mode";

import { ChevronLeft } from "lucide-react";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import { CategoryProductsSliderConfigSchema, parseBySchema } from "@/modules/home-template/types";
import { usePublicCategoryProducts } from "@/modules/product/hooks";

type ApiItem = {
    id: string;
    slug: string;
    title: string;
    imageUrl: string | null;
    price: number | null;
    oldPrice: number | null;
    discountPercent: number | null;
};

function clamp(n: number, min: number, max: number) {
    return Math.min(Math.max(n, min), max);
}

function formatToman(n?: number | null) {
    if (n == null || n <= 0) return "تماس بگیرید";
    return n.toLocaleString("fa-IR");
}

function safeImageSrc(url: string) {
    return url ? encodeURI(url) : "";
}

export function CategoryProductsSliderFromConfig({ configJson }: { configJson: string }) {
    const cfg = useMemo(
        () =>
            parseBySchema(CategoryProductsSliderConfigSchema, configJson, {
                boxed: true,
                title: "محصولات منتخب",
                take: 12,
                categoryIds: [],
                showAllHref: "",
                showAllText: "نمایش همه",
            }),
        [configJson]
    );

    const take = clamp(Number(cfg.take ?? 12), 1, 50);

    const categoryIds = useMemo(() => {
        return (cfg.categoryIds ?? [])
            .map((x: string) => (x ?? "").trim())
            .filter(Boolean)
            .sort();
    }, [cfg.categoryIds]);

    if (categoryIds.length === 0) return null;

    const { data, isLoading, error } = usePublicCategoryProducts({ take, categoryIds });
    const items = (data ?? []) as ApiItem[];
    const [isBeginning, setIsBeginning] = useState(true);
    const [isAtEnd, setIsAtEnd] = useState(false);
    const swiperRef = useRef<SwiperType | null>(null);
    const prevRef = useRef<HTMLButtonElement | null>(null);
    const nextRef = useRef<HTMLButtonElement | null>(null);
    const wrapClass = cfg.boxed ? "w-full max-w-[1336px] mx-auto px-4 2xl:px-0" : "w-full";


    if (error) return null;

    if (isLoading && !data) {
        return (
            <div className={`${wrapClass} my-6`}>
                <div className="h-[260px] rounded-2xl bg-neutral-100 animate-pulse w-full" />
            </div>
        );
    }

    if (!items || items.length === 0) return null;

    return (
        <section className={`${wrapClass} my-4`}>
            <section className="rounded-2xl border border-slate-200 bg-white pb-5 pt-6">
                {/* Header */}
                <div className="flex items-center justify-between px-4 lg:px-8 pb-3">
                    <h2 className="text-sm lg:text-[22px] font-bold text-slate-900">{cfg.title}</h2>

                    {cfg.showAllHref?.trim() ? (
                        <Link
                            href={cfg.showAllHref}
                            className="flex items-center gap-1 text-xs lg:text-base font-semibold text-slate-700 hover:text-slate-900"
                        >
                            <span>{cfg.showAllText || "نمایش همه"}</span>
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                    ) : null}
                </div>

                {/* Slider */}
                <div className="relative px-4 lg:px-6">
                    {!isBeginning && (
                        <button
                            ref={prevRef}
                            type="button"
                            onClick={() => swiperRef.current?.slidePrev()}
                            className="hidden lg:flex items-center justify-center absolute z-20 right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white border border-slate-200 shadow"
                            aria-label="قبلی"
                        >
                            <ChevronLeft className="h-6 w-6 rotate-180" />
                        </button>
                    )}

                    {!isAtEnd && (
                        <button
                            ref={nextRef}
                            type="button"
                            onClick={() => swiperRef.current?.slideNext()}
                            className="hidden lg:flex items-center justify-center absolute z-20 left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white border border-slate-200 shadow"
                            aria-label="بعدی"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                    )}

                    <Swiper
                        dir="rtl"
                        modules={[FreeMode, Navigation]}
                        freeMode
                        slidesPerView="auto"
                        spaceBetween={14}
                        onSwiper={(s) => {
                            swiperRef.current = s;
                            setTimeout(() => {
                                if (!s?.params?.navigation) return;
                                const nav = s.params.navigation as any;
                                nav.prevEl = prevRef.current;
                                nav.nextEl = nextRef.current;
                                s.navigation?.destroy?.();
                                s.navigation?.init?.();
                                s.navigation?.update?.();
                            }, 0);

                            setIsBeginning(true);
                            setIsAtEnd(false);
                        }}
                        onSlideChange={(s) => {
                            setIsBeginning(s.isBeginning);
                            setIsAtEnd(s.isEnd || s.progress >= 0.99);
                        }}
                        className="w-full"
                    >
                        {items.map((p, idx) => {
                            const img = safeImageSrc(resolveMediaUrl(p.imageUrl || ""));
                            return (
                                <SwiperSlide key={p.id} className="!w-[210px] lg:!w-[230px]">
                                    <div className="relative h-full">
                                        <Link href={`/product/${encodeURIComponent(p.slug)}`} className="flex flex-col items-center text-center px-2 py-2">
                                            <div className="relative w-[132px] h-[132px] lg:w-[186px] lg:h-[186px]">
                                                {img ? (
                                                    <img src={img} alt={p.title} className="object-contain" />
                                                ) : (
                                                    <div className="absolute inset-0 rounded-xl bg-slate-50 border border-slate-100" />
                                                )}
                                            </div>

                                            <div className="mt-3 line-clamp-2 h-[44px] text-xs lg:text-sm font-medium text-slate-900 leading-6">
                                                {p.title}
                                            </div>

                                            <div className="mt-3 w-full flex flex-col items-end gap-1">
                                                <div className="w-full flex items-center justify-between">
                                                    {p.discountPercent ? (
                                                        <div className="min-w-8 h-5 px-1 rounded bg-rose-600 text-white text-xs font-bold flex items-center justify-center">
                                                            {p.discountPercent}%
                                                        </div>
                                                    ) : (
                                                        <span />
                                                    )}

                                                    <div className="flex items-baseline gap-1">
                                                        {p.price && p.price > 0 ? (
                                                            <>
                                                                <span className="text-base lg:text-lg font-bold text-slate-900">
                                                                    {p.price.toLocaleString("fa-IR")}
                                                                </span>
                                                                <span className="text-xs text-slate-700">تومان</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-sm font-semibold text-slate-600">
                                                                تماس بگیرید
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {p.oldPrice && p.oldPrice > p.price ? (
                                                    <div className="flex items-center gap-1 text-xs text-slate-400 line-through">
                                                        {formatToman(p.oldPrice)} تومان
                                                    </div>
                                                ) : null}
                                            </div>
                                        </Link>

                                        {idx !== items.length - 1 ? (
                                            <div className="hidden lg:block absolute left-0 top-6 h-[290px] w-px bg-slate-100" />
                                        ) : null}
                                    </div>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                </div>
            </section>
        </section>
    );
}
