"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

import { resolveMediaUrl } from "@/modules/media/resolve-url";
import { usePublicBrandOptions } from "@/modules/brand/hooks";
import { TopBrandsConfigSchema, parseBySchema } from "@/modules/home-template/types";

export function TopBrandsFromConfig(props: { configJson: string }) {
    const cfg = useMemo(
        () => parseBySchema(TopBrandsConfigSchema, props.configJson),
        [props.configJson]
    );

    const wrapClass = cfg.boxed
        ? "w-full max-w-[1336px] mx-auto px-4 2xl:px-0"
        : "w-full";

    const brandsQ = usePublicBrandOptions();
    const all = brandsQ.data ?? [];

    const selected = useMemo(() => {
        const set = new Set((cfg.brandIds ?? []).map(String));
        const list = all.filter((x) => set.has(x.id));
        // حفظ ترتیب انتخاب ادمین
        const byId = new Map(list.map((x) => [x.id, x]));
        return (cfg.brandIds ?? []).map((id) => byId.get(id)).filter(Boolean) as typeof list;
    }, [all, cfg.brandIds]);

    // --- navigation state مثل CategoryIcons ---
    const [isBeginning, setIsBeginning] = useState(true);
    const [isAtEnd, setIsAtEnd] = useState(false);

    const swiperRef = useRef<SwiperType | null>(null);
    const prevRef = useRef<HTMLButtonElement | null>(null);
    const nextRef = useRef<HTMLButtonElement | null>(null);

    // وقتی تعداد آیتم‌ها عوض شد، وضعیت ابتدا/انتها رو reset کن
    useEffect(() => {
        setIsBeginning(true);
        setIsAtEnd(false);
    }, [selected.length]);

    if (!selected.length) return null;

    return (
        <section className={`${wrapClass} py-6`}>
            <div className="w-full bg-white lg:rounded-2xl lg:border lg:border-slate-200 py-6">
                <div className="flex items-center justify-center gap-2">
                    <div className="h-6 w-6 text-yellow-500">
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 2 9.5 8.5 2 9.3l5.6 4.8L6 21.5 12 18l6 3.5-1.6-7.4L22 9.3l-7.5-.8L12 2z" />
                        </svg>
                    </div>
                    <p className="text-lg font-extrabold text-slate-900">
                        {cfg.title ?? "محبوب‌ترین برندها"}
                    </p>
                </div>

                <div className="mt-4 px-2 sm:px-4">
                    <div className="relative w-full">
                        {/* قبلی: فقط وقتی از ابتدا رد شدیم */}
                        {!isBeginning && (
                            <button
                                ref={prevRef}
                                type="button"
                                onClick={() => swiperRef.current?.slidePrev()}
                                className="hidden lg:flex items-center justify-center rounded-full cursor-pointer z-10
                  border border-slate-200 bg-white h-[40px] w-[40px]
                  absolute right-2 top-1/2 -translate-y-1/2
                  text-slate-600 hover:text-red-500 transition-colors shadow-md"
                                aria-label="قبلی"
                            >
                                {/* RTL: قبلی باید فلش برعکس شود */}
                                <ChevronLeft className="h-6 w-6 rotate-180" />
                            </button>
                        )}

                        {/* بعدی: فقط وقتی به انتها نرسیدیم */}
                        {!isAtEnd && (
                            <button
                                ref={nextRef}
                                type="button"
                                onClick={() => swiperRef.current?.slideNext()}
                                className="hidden lg:flex items-center justify-center rounded-full cursor-pointer z-10
                  border border-slate-200 bg-white h-[40px] w-[40px]
                  absolute left-2 top-1/2 -translate-y-1/2
                  text-slate-600 hover:text-red-500 transition-colors shadow-md"
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
                            spaceBetween={0}
                            // ✅ navigation wiring مثل CategoryIcons
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
                            {selected.map((b, idx) => {
                                const raw = (b.logoUrl ?? "").trim();
                                const normalized =
                                    raw && !raw.startsWith("/") && !raw.startsWith("http") ? `/${raw}` : raw;
                                const img = resolveMediaUrl(normalized);

                                const isLast = idx === selected.length - 1;

                                return (
                                    <SwiperSlide
                                        key={b.id}
                                        style={{ width: "auto", height: "auto" }}
                                        className="relative"
                                    >
                                        <Link
                                            href={`/brand/${b.slug}`}
                                            className="px-4 py-1 overflow-hidden flex items-center justify-center h-full shrink-0"
                                        >
                                            <div
                                                className="flex items-center justify-center"
                                                style={{ width: 110, height: 110, lineHeight: 0 }}
                                                aria-label={b.title}
                                            >
                                                {img ? (
                                                    <img
                                                        src={img}
                                                        alt={b.title}
                                                        width={110}
                                                        height={110}
                                                        loading="lazy"
                                                        className="w-full h-full object-contain"
                                                    />
                                                ) : (
                                                    <div className="w-[110px] h-[110px] rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xs text-slate-400">
                                                        بدون لوگو
                                                    </div>
                                                )}
                                            </div>
                                        </Link>

                                        {/* divider عمودی مثل دیجی‌کالا */}
                                        {!isLast && (
                                            <span
                                                aria-hidden
                                                className="absolute left-0 top-1/2 -translate-y-1/2
                     h-[64px] w-px bg-slate-200"
                                            />
                                        )}
                                    </SwiperSlide>
                                );
                            })}

                        </Swiper>
                    </div>
                </div>
            </div>
        </section>
    );
}
