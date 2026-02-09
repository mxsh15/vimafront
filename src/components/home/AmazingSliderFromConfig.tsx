"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/free-mode";

import { resolveMediaUrl } from "@/modules/media/resolve-url";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { AmazingProductsConfigSchema, parseBySchema } from "@/modules/home-template/types";
import { CountdownInline, isVisibleNow } from "./CounterTimerAmazingSlider";

type AmazingProductDto = {
  id: string;
  slug: string;
  title: string;
  imageUrl?: string | null;
  price?: number | null;          // قیمت اصلی (یا نهایی اگر تخفیف نداره)
  discountPrice?: number | null;  // قیمت تخفیفی
};

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

function formatToman(n?: number | null) {
  if (n == null) return "";
  return n.toLocaleString("fa-IR");
}

function calcDiscountPercent(price?: number | null, discountPrice?: number | null) {
  if (price == null || discountPrice == null) return null;
  if (price <= 0) return null;
  if (discountPrice >= price) return null;
  const p = Math.round(((price - discountPrice) / price) * 100);
  return Number.isFinite(p) && p > 0 ? p : null;
}

async function fetchAmazingProducts(params: { take: number; categoryIds: string[] }) {
  const qs = new URLSearchParams();
  qs.set("take", String(params.take));

  for (const id of params.categoryIds) {
    if (id && id.trim()) qs.append("categoryIds", id.trim());
  }

  const res = await fetch(`/api/public/amazing-products?${qs.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Amazing products fetch failed: ${res.status} ${text}`);
  }

  return (await res.json()) as AmazingProductDto[];
}

export function AmazingSliderFromConfig({
  configJson,
  take: takeOverride,
  categoryId: categoryIdOverride,
  categoryIds: categoryIdsOverride,
}: {
  configJson: string;
  take?: number | null;
  categoryId?: string | null;
  categoryIds?: string[] | null;
}) {
  const cfg = useMemo(
    () =>
      parseBySchema(AmazingProductsConfigSchema, configJson, {
        boxed: true,
        title: "پیشنهاد شگفت‌انگیز",
        take: 20,
        categoryId: null,
        startAtUtc: null,
        endAtUtc: null,
      }),
    [configJson]
  );

  if (!isVisibleNow({ startAtUtc: cfg.startAtUtc, endAtUtc: cfg.endAtUtc })) return null;

  const take = clamp(Number(takeOverride ?? cfg.take ?? 20), 1, 50);

  const categoryIds = (() => {
    if (Array.isArray(categoryIdsOverride) && categoryIdsOverride.length > 0) {
      return categoryIdsOverride.map((x) => x.trim()).filter(Boolean);
    }

    if (typeof categoryIdOverride === "string" && categoryIdOverride.trim() !== "") {
      return [categoryIdOverride.trim()];
    }

    const cfgIds = (cfg as any).categoryIds;
    if (Array.isArray(cfgIds) && cfgIds.length > 0) {
      return cfgIds.map((x: any) => String(x).trim()).filter(Boolean);
    }

    const legacy = (cfg as any).categoryId;
    if (typeof legacy === "string" && legacy.trim() !== "") {
      return [legacy.trim()];
    }

    return [] as string[];
  })();
  const boxed = !!cfg.boxed;

  const [items, setItems] = useState<AmazingProductDto[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [isBeginning, setIsBeginning] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const swiperRef = useRef<SwiperType | null>(null);
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    setItems(null);
    setErr(null);

    fetchAmazingProducts({ take, categoryIds })
      .then((data) => {
        if (cancelled) return;
        const arr = Array.isArray(data) ? data : [];
        setItems(
          arr
            .filter((x) => !!x?.slug && x.slug.trim() !== "") 
            .filter((x) => (x.discountPrice ?? x.price ?? 0) > 0)
        );
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setErr(e instanceof Error ? e.message : "Unknown error");
        setItems([]);
      });

    return () => {
      cancelled = true;
    };
  }, [take, categoryIds.join("|")]);

  if (err) return null;
  if (items && items.length === 0) return null;

  const wrapClass = boxed ? "container mx-auto" : "";

  if (items == null) {
    return (
      <div className={`${wrapClass} my-6`}>
        <div className="h-[240px] rounded-2xl bg-neutral-100 animate-pulse w-full" />
      </div>
    );
  }

  if (!isVisibleNow({ startAtUtc: cfg.startAtUtc, endAtUtc: cfg.endAtUtc })) return null;

  return (
    <section className={wrapClass}>
      <section className="rounded-[18px] bg-[#ef394e] p-[2px] lg:p-0 overflow-hidden relative group">
        <div className="w-full py-3 lg:py-5 pr-2 lg:pr-0">

          <div className="relative w-full">
            {/* دکمه‌های شناور دسکتاپ */}
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
              freeMode={true}
              slidesPerView="auto"
              spaceBetween={2}
              onSwiper={(s) => {
                swiperRef.current = s;

                // Navigation wiring (مثل روش قبلی تو)
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
                    <div className="lg:mt-3">
                      <CountdownInline startAtUtc={cfg.startAtUtc} endAtUtc={cfg.endAtUtc} />
                    </div>

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

              {/* --- SLIDE 2..N: Products --- */}
              {items.map((p, idx) => {
                const finalPrice = (p.discountPrice ?? p.price) ?? 0;
                const oldPrice = p.discountPrice != null ? p.price : null;
                const hasDiscount = oldPrice != null && oldPrice > finalPrice;
                const percent = calcDiscountPercent(oldPrice, finalPrice);
                const percentText = percent != null ? `${percent}٪` : "";

                return (
                  <SwiperSlide key={p.id} className="!w-auto !h-auto pl-[2px]">
                    <Link
                      href={`/product/${p.slug}`}
                      className={`
                        block relative bg-white overflow-hidden h-full shrink-0 cursor-pointer transition-transform hover:brightness-[1.02]
                        w-[130px] sm:w-[142px] lg:w-[148px] xl:w-[155px]
                        py-3 px-2 lg:px-3
                        ${idx === 0 ? "rounded-r-[12px] lg:rounded-r-lg" : ""}
                        ${idx === items.length - 1 ? "rounded-l-[12px] lg:rounded-l-none" : ""}
                      `}
                    >
                      <article className="flex flex-col h-full justify-between gap-3">
                        {/* Image */}
                        <div className="aspect-square w-full relative mb-1">
                          {p.imageUrl ? (
                            <Image
                              src={resolveMediaUrl(p.imageUrl)}
                              alt={p.title ?? ""}
                              fill
                              unoptimized
                              className="object-contain"
                              sizes="160px"
                            />
                          ) : null}
                        </div>

                        {/* Content */}
                        <div className="flex flex-col gap-2">
                          <h3 className="text-[11px] lg:text-[12px] leading-5 text-neutral-600 line-clamp-2 min-h-[40px] font-medium">
                            {p.title}
                          </h3>

                          <div className="flex flex-col gap-1 mt-auto">
                            <div className="flex items-center justify-between min-h-[20px]">
                              {hasDiscount && percent != null ? (
                                <div className="bg-[#ef394e] text-white text-[10px] lg:text-[11px] font-bold px-2 py-[1px] rounded-full">
                                  {percentText}
                                </div>
                              ) : (
                                <span />
                              )}

                              {hasDiscount ? (
                                <span className="text-[11px] text-neutral-300 line-through decoration-neutral-300">
                                  {formatToman(oldPrice)}
                                </span>
                              ) : null}
                            </div>

                            <div className="flex items-center justify-end gap-1 text-neutral-700">
                              <span className="text-[14px] lg:text-[15px] font-bold">
                                {formatToman(finalPrice)}
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

              {/* --- LAST SLIDE: View All --- */}
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
    </section>
  );
}
