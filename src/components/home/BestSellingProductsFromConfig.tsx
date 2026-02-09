"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

import { resolveMediaUrl } from "@/modules/media/resolve-url";
import { usePublicBestSellingProducts } from "@/modules/product/hooks";

function chunk3<T>(arr: T[]) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += 3) out.push(arr.slice(i, i + 3));
  return out;
}

function faRank(n: number) {
  return (n + 1).toLocaleString("fa-IR");
}

export function BestSellingProductsFromConfig() {
  const wrapClass = "w-full max-w-[1336px] mx-auto px-4 2xl:px-0";

  const q = usePublicBestSellingProducts(18);
  const items = q.data ?? [];
  const slides = useMemo(() => chunk3(items), [items]);

  const [isBeginning, setIsBeginning] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const swiperRef = useRef<SwiperType | null>(null);
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  if (!items.length) return null;

  return (
    <section className={`${wrapClass} py-4`}>
      <div className="w-full flex flex-col justify-center py-4 bg-white lg:rounded-2xl lg:border lg:border-slate-200">
        {/* Header */}
        <div className="flex justify-between lg:justify-center items-center px-2 lg:px-5 relative">
          <div className="flex justify-center items-center">
            <div className="flex ml-2" aria-hidden="false">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-yellow-500" fill="currentColor" aria-hidden="true">
                <path d="M12 2 9.5 8.5 2 9.3l5.6 4.8L6 21.5 12 18l6 3.5-1.6-7.4L22 9.3l-7.5-.8L12 2z" />
              </svg>
            </div>
            <p className="text-lg font-extrabold text-slate-900">پرفروش‌ترین کالاها</p>
          </div>

          <Link href="/best-selling" className="lg:absolute left-0 top-0 pl-4 shrink-0">
            <span className="inline-flex items-center h-10 text-sm font-semibold text-slate-600 hover:text-slate-900">
              مشاهده همه
            </span>
          </Link>
        </div>

        {/* Slider */}
        <div className="px-2 mt-5 lg:mt-7">
          <div className="relative w-full">
            {/* دکمه‌های شناور دسکتاپ (مثل AmazingSlider) */}
            {!isBeginning && (
              <button
                ref={prevRef}
                type="button"
                onClick={() => swiperRef.current?.slidePrev()}
                className="hidden lg:flex justify-center items-center bg-white absolute z-20 cursor-pointer rounded-full shadow-md border border-slate-100
                  right-2 top-1/2 -translate-y-1/2 h-10 w-10 text-slate-600 hover:text-red-500 transition-colors"
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
                className="hidden lg:flex justify-center items-center bg-white absolute z-20 cursor-pointer rounded-full shadow-md border border-slate-100
                  left-2 top-1/2 -translate-y-1/2 h-10 w-10 text-slate-600 hover:text-red-500 transition-colors"
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
              spaceBetween={20}
              onSwiper={(s) => {
                swiperRef.current = s;

                // ✅ navigation wiring دقیقاً مثل AmazingSlider
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
                setIsAtEnd(s.isEnd || s.progress >= 0.99);
              }}
              onSlideChange={(s) => {
                setIsBeginning(s.isBeginning);
                setIsAtEnd(s.isEnd || s.progress >= 0.99);
              }}
              onReachBeginning={() => setIsBeginning(true)}
              onReachEnd={() => setIsAtEnd(true)}
              className="w-full"
            >
              {slides.map((group, slideIdx) => (
                <SwiperSlide key={`best-${slideIdx}`} style={{ width: 314.5, height: "auto" }}>
                  <div className="flex flex-col">
                    {group.map((p, localIdx) => {
                      const globalRank = slideIdx * 3 + localIdx; // 0..17
                      const img = resolveMediaUrl(p.imageUrl ?? "");

                      return (
                        <Link key={p.id} href={`/product/${p.slug}`} className="flex items-center py-3">
                          <div
                            className="rounded shrink-0 ml-3 bg-white"
                            style={{ width: 86, height: 86, lineHeight: 0 }}
                            aria-label={p.title}
                          >
                            {img ? (
                              <img
                                className="w-full h-full inline-block"
                                src={img}
                                width={86}
                                height={86}
                                alt={p.title}
                                style={{ objectFit: "contain" }}
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full rounded bg-slate-50 border border-slate-200" />
                            )}
                          </div>

                          <span className="text-yellow-500 text-2xl font-extrabold ml-3 flex items-center">
                            {faRank(globalRank)}
                          </span>

                          <div className="grow flex flex-col justify-center">
                            <p className="text-sm text-slate-700 line-clamp-2">{p.title}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}
