"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/free-mode";

// فرض بر این است که این مسیرها در پروژه شما وجود دارند
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import { usePublicAmazingProducts } from "@/modules/amazing-products/hooks";
import type { PublicAmazingProduct } from "@/modules/amazing-products/api";

function formatToman(n: number) {
    return n.toLocaleString("fa-IR");
}

function PercentMark() {
    return (
        <svg viewBox="0 0 120 120" className="h-16 w-16 text-white/90" aria-hidden="true">
            <path d="M24 92 L92 24" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
            <circle cx="36" cy="36" r="10" fill="currentColor" />
            <circle cx="80" cy="80" r="10" fill="currentColor" />
        </svg>
    );
}

export function AmazingSlider() {
    // تعداد بیشتری درخواست می‌دهیم تا مطمئن شویم اسکرول به اندازه کافی پر می‌شود
    const q = usePublicAmazingProducts(20);
    const items = (q.data ?? []) as PublicAmazingProduct[];
    const priced = useMemo(() => items.filter((x) => (x.price ?? 0) > 0), [items]);

    const [isBeginning, setIsBeginning] = useState(true);
    const [isAtEnd, setIsAtEnd] = useState(false);
    const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

    // Skeleton Loading
    if (q.isLoading) {
        return (
            <div className="container mx-auto px-4 my-6">
                <div className="h-[240px] rounded-2xl bg-neutral-100 animate-pulse w-full" />
            </div>
        );
    }

    if (priced.length === 0) return null;

    return (
        <div className="container mx-auto px-4 my-6">
            {/* Main Container: Red Background */}
            <section className="rounded-[18px] bg-[#ef394e] p-[2px] lg:p-0 overflow-hidden relative group">

                <div className="w-full py-3 lg:py-5 pr-2 lg:pr-0">
                    <div className="relative w-full">

                        {/* Navigation Buttons (Desktop Only) */}
                        {!isBeginning && (
                            <button
                                onClick={() => swiperInstance?.slidePrev()}
                                className="hidden lg:flex justify-center items-center bg-white absolute z-20 cursor-pointer rounded-full shadow-md border border-slate-100
                                right-2 top-1/2 -translate-y-1/2 h-10 w-10 text-slate-600 hover:text-red-500 transition-colors"
                            >
                                <ChevronLeft className="h-6 w-6 rotate-180" />
                            </button>
                        )}

                        {!isAtEnd && (
                            <button
                                onClick={() => swiperInstance?.slideNext()}
                                className="hidden lg:flex justify-center items-center bg-white absolute z-20 cursor-pointer rounded-full shadow-md border border-slate-100
                                left-2 top-1/2 -translate-y-1/2 h-10 w-10 text-slate-600 hover:text-red-500 transition-colors"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                        )}

                        <Swiper
                            dir="rtl"
                            modules={[FreeMode]}
                            freeMode={true}
                            // 'auto' is crucial here for fluid design
                            slidesPerView="auto"
                            spaceBetween={2}
                            onSwiper={setSwiperInstance}
                            onSlideChange={(s) => {
                                setIsBeginning(s.isBeginning);
                                setIsAtEnd(s.isEnd || s.progress >= 0.99);
                            }}
                            className="!px-2 lg:!px-0 w-full h-full"
                        >
                            {/* --- SLIDE 1: Amazing Offer Banner --- */}
                            <SwiperSlide className="!w-auto !h-auto">
                                <Link
                                    href="/incredible-offers"
                                    className="relative z-10 flex flex-row lg:flex-col items-center justify-between lg:justify-center 
                                    gap-4 px-4 py-2 lg:py-0 h-full w-[280px] lg:w-[100px] mx-2 lg:mx-4 shrink-0"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="relative w-[70px] h-[70px] lg:w-[88px] lg:h-[88px]">
                                            <Image
                                                src="/images/Amazings.svg"
                                                alt="amazings"
                                                fill
                                                className="object-contain"
                                                priority
                                            />
                                        </div>

                                        {/* Timer / Placeholder Image */}
                                        <div className="hidden lg:block relative w-[100px] h-[80px]">
                                            <Image
                                                src="/images/Amazing.svg"
                                                alt="amazings"
                                                fill
                                                className="object-contain"
                                                priority
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 text-white lg:mt-4">
                                        <span className="text-sm font-medium">مشاهده همه</span>
                                        <ChevronLeft className="h-4 w-4" />
                                    </div>
                                </Link>
                            </SwiperSlide>

                            {/* --- SLIDE 2 to N: Products --- */}
                            {priced.map((p, idx) => {
                                const hasDiscount = !!p.oldPrice && p.oldPrice > p.price;
                                const percentText = typeof p.discountPercent === "number" ? `${p.discountPercent}٪` : "";

                                return (
                                    <SwiperSlide key={p.id} className="!w-auto !h-auto pl-[2px]">
                                        <Link
                                            href={`/product/${p.id}`}
                                            className={`
                                                block relative bg-white overflow-hidden h-full shrink-0 cursor-pointer transition-transform hover:brightness-[1.02]
                                                w-[130px] sm:w-[142px] lg:w-[148px] xl:w-[155px]
                                                py-3 px-2 lg:px-3
                                                ${idx === 0 ? "rounded-r-[12px] lg:rounded-r-lg" : ""}
                                                ${idx === priced.length - 1 ? "rounded-l-[12px] lg:rounded-l-none" : ""}
                                            `}
                                        >
                                            <article className="flex flex-col h-full justify-between gap-3">

                                                {/* Image Area */}
                                                <div className="aspect-square w-full relative mb-1">
                                                    <img
                                                        className="w-full h-full object-contain mix-blend-multiply"
                                                        src={resolveMediaUrl(p.imageUrl ?? "")}
                                                        alt={p.title}
                                                        loading="lazy"
                                                    />
                                                </div>

                                                {/* Content Area */}
                                                <div className="flex flex-col gap-2">
                                                    {/* Title */}
                                                    <h3 className="text-[11px] lg:text-[12px] leading-5 text-neutral-600 line-clamp-2 min-h-[40px] font-medium">
                                                        {p.title}
                                                    </h3>

                                                    {/* Price Info */}
                                                    <div className="flex flex-col gap-1 mt-auto">
                                                        {/* Top Row: Discount & Original Price */}
                                                        <div className="flex items-center justify-between min-h-[20px]">
                                                            {hasDiscount && (
                                                                <div className="bg-[#ef394e] text-white text-[10px] lg:text-[11px] font-bold px-2 py-[1px] rounded-full">
                                                                    {percentText}
                                                                </div>
                                                            )}
                                                            {hasDiscount && (
                                                                <span className="text-[11px] text-neutral-300 line-through decoration-neutral-300">
                                                                    {formatToman(p.oldPrice!)}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Bottom Row: Final Price */}
                                                        <div className="flex items-center justify-end gap-1 text-neutral-700">
                                                            <span className="text-[14px] lg:text-[15px] font-bold">
                                                                {formatToman(p.price)}
                                                            </span>
                                                            <span className="text-[10px] font-light">تومان</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        </Link>
                                    </SwiperSlide>
                                );
                            })}

                            <SwiperSlide className="!w-auto !h-auto pl-1">
                                <div className="h-full bg-white rounded-l-[12px] lg:rounded-l-lg overflow-hidden">
                                    <Link
                                        href="/incredible-offers"
                                        className="flex flex-col items-center justify-center h-full 
                                        w-[130px] sm:w-[142px] lg:w-[148px] hover:bg-neutral-50 transition-colors"
                                    >
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full border border-sky-400 text-sky-500 mb-2">
                                            <ArrowLeft className="w-6 h-6" />
                                        </div>
                                        <span className="text-neutral-700 text-sm font-semibold">مشاهده همه</span>
                                    </Link>
                                </div>
                            </SwiperSlide>
                        </Swiper>
                    </div>
                </div>
            </section>
        </div>
    );
}