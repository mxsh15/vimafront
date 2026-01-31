"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Swiper as SwiperType } from "swiper";
import { usePublicHomeBanners } from "@/modules/homeBanner/hooks";
import { resolveMediaUrl } from "@/modules/media/resolve-url";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { HeroSliderSkeleton } from "./HeroSliderSkeleton";

export function HeroSlider() {
    const q = usePublicHomeBanners();
    const items = useMemo(() => q.data ?? [], [q.data]);
    const prevRef = useRef<HTMLButtonElement | null>(null);
    const nextRef = useRef<HTMLButtonElement | null>(null);

    if (q.isLoading) {
        return (
            <div className="w-full rounded-2xl bg-neutral-100 h-[220px] md:h-[320px] animate-pulse" />
        );
    }

    if (q.isError) {
        return (
            <div className="w-full rounded-2xl border p-4 text-sm text-red-600">
                خطا در دریافت بنرها: {(q.error as Error).message}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="w-full rounded-2xl bg-neutral-50 border h-[220px] md:h-[320px] grid place-items-center text-sm text-neutral-500">
                بنری برای نمایش وجود ندارد
            </div>
        );
    }

    if (q.isLoading) {
        return <HeroSliderSkeleton />;
    }

    return (
        <div className="group relative w-full overflow-hidden">
            <button
                ref={prevRef}
                type="button"
                className="hero-nav pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition
                   absolute bottom-4 right-6 z-20 grid h-10 w-10 place-items-center rounded-full bg-white shadow
                   text-slate-700 hover:bg-slate-50"
                aria-label="قبلی"
            >
                <ChevronRight className="h-5 w-5" />
            </button>

            <button
                ref={nextRef}
                type="button"
                className="hero-nav pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition
                   absolute bottom-4 right-20 z-20 grid h-10 w-10 place-items-center rounded-full bg-white shadow
                   text-slate-700 hover:bg-slate-50"
                aria-label="بعدی"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>
            <Swiper
                className="hero-swiper"
                modules={[Autoplay, Pagination, Navigation]}
                autoplay={{ delay: 3500, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                navigation={{
                    prevEl: prevRef.current,
                    nextEl: nextRef.current,
                }}
                onBeforeInit={(swiper: SwiperType) => {
                    swiper.params.navigation.prevEl = prevRef.current;
                    swiper.params.navigation.nextEl = nextRef.current;
                }}
                onInit={(swiper: SwiperType) => {
                    swiper.navigation.init();
                    swiper.navigation.update();
                }}
                loop
            >
                {items.map((x, idx) => {
                    const img = (
                        <img
                            src={resolveMediaUrl(x.mediaUrl)}
                            alt={x.altText ?? x.title ?? `banner-${idx + 1}`}
                            className="w-full h-[220px] md:h-[320px] object-cover"
                            loading={idx === 0 ? "eager" : "lazy"}
                        />
                    );

                    return (
                        <SwiperSlide key={`${x.mediaAssetId}-${idx}`}>
                            {x.linkUrl ? <Link href={x.linkUrl} className="block">{img}</Link> : img}
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
}
