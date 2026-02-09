"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Swiper as SwiperType } from "swiper";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import { HeroSliderSkeleton } from "./HeroSliderSkeleton";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

type HeroSliderItem = { imageUrl: string; href?: string | null };

type Props = {
  items?: HeroSliderItem[];
  isLoading?: boolean;
  error?: Error | null;
  useSkeletonOnLoading?: boolean;
};

export function HeroSliderFromConfig({
  items: rawItems,
  isLoading = false,
  error = null,
  useSkeletonOnLoading = true,
}: Props) {
  const items = useMemo(() => rawItems ?? [], [rawItems]);
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  if (isLoading) {
    return useSkeletonOnLoading ? (
      <HeroSliderSkeleton />
    ) : (
      <div className="w-full rounded-2xl bg-neutral-100 h-[220px] md:h-[320px] animate-pulse" />
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-2xl border p-4 text-sm text-red-600">
        خطا در دریافت بنرها: {error.message}
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="group relative w-full overflow-hidden bg-slate-100">
      {/* Prev */}
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

      {/* Next */}
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
        dir="rtl"
        className="hero-swiper"
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
        onBeforeInit={(swiper: SwiperType) => {
          swiper.params.navigation = swiper.params.navigation || {};
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
              src={resolveMediaUrl(x.imageUrl)}
              alt={`banner-${idx + 1}`}
              className="w-full h-[220px] md:h-[320px] object-cover"
              loading={idx === 0 ? "eager" : "lazy"}
            />
          );

          return (
            <SwiperSlide key={`${x.imageUrl}-${idx}`}>
              {x.href ? (
                <Link href={x.href} className="block w-full h-full">
                  {img}
                </Link>
              ) : (
                img
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
