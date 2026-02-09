"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

import { listPublicCategoryOptions } from "@/modules/category/api";
import type { CategoryOptionDto } from "@/modules/category/types";
import { resolveMediaUrl } from "@/modules/media/resolve-url";

type Item = { categoryId: string; imageUrl?: string };

function getCategoryHref(c: CategoryOptionDto) {
    return `/category/${c.id}`;
}

function chunk2<T>(arr: T[]) {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += 2) out.push(arr.slice(i, i + 2));
    return out;
}

export function CategoryIconsFromConfig(props: {
    title: string;
    boxed: boolean;
    imageSize: number;
    items: Item[];
}) {
    const [options, setOptions] = useState<CategoryOptionDto[]>([]);

    const [isBeginning, setIsBeginning] = useState(true);
    const [isAtEnd, setIsAtEnd] = useState(false);

    const swiperRef = useRef<SwiperType | null>(null);
    const prevRef = useRef<HTMLButtonElement | null>(null);
    const nextRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        let mounted = true;
        listPublicCategoryOptions().then((res) => mounted && setOptions(res ?? []));
        return () => {
            mounted = false;
        };
    }, []);

    const byId = useMemo(() => {
        const m = new Map<string, CategoryOptionDto>();
        for (const o of options) m.set(o.id, o);
        return m;
    }, [options]);

    const rows = useMemo(() => {
        return (props.items ?? [])
            .map((x) => {
                const c = byId.get(x.categoryId);
                if (!c) return null;

                const catImage =
                    x.imageUrl ??
                    (c as any).imageUrl ??
                    (c as any).iconUrl ??
                    (c as any).thumbnailUrl ??
                    (c as any).mediaUrl ??
                    "";

                return {
                    id: c.id,
                    title: c.title,
                    href: getCategoryHref(c),
                    imageUrl: catImage,
                };
            })
            .filter(Boolean) as Array<{ id: string; title: string; href: string; imageUrl: string }>;
    }, [props.items, byId]);

    const slides = useMemo(() => chunk2(rows), [rows]);

    if (!rows.length) return null;

    const wrapClass = props.boxed
        ? "w-full max-w-[1336px] mx-auto px-4 2xl:px-0"
        : "w-full";
    const size = Math.max(56, Math.min(140, props.imageSize ?? 100));

    return (
        <div className={wrapClass}>
            <div className="w-full py-3 lg:pt-4 lg:pb-10 flex flex-col items-center">
                <div className="mb-6 lg:mb-9 text-center">
                    <h3 className="text-h3">{props.title}</h3>
                </div>

                <div className="relative w-full dk-main-slider">
                    {/* دکمه قبلی: فقط وقتی از ابتدا رد شدیم */}
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
                            {/* RTL: برای قبلی باید فلش برعکس شود */}
                            <ChevronLeft className="h-6 w-6 rotate-180" />
                        </button>
                    )}

                    {/* دکمه بعدی: فقط وقتی به انتها نرسیدیم */}
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
                        onSwiper={(s) => {
                            swiperRef.current = s;

                            // navigation wiring (مثل AmazingSlider)
                            setTimeout(() => {
                                if (!s?.params?.navigation) return;
                                const nav = s.params.navigation as any;
                                nav.prevEl = prevRef.current;
                                nav.nextEl = nextRef.current;
                                s.navigation?.destroy?.();
                                s.navigation?.init?.();
                                s.navigation?.update?.();
                            }, 0);

                            // initial state
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
                        {slides.map((pair, slideIdx) => (
                            <SwiperSlide key={`slide-${slideIdx}`} style={{ width: 178.133 }}>
                                <div className="flex flex-col items-center justify-between gap-2">
                                    {pair.map((x) => (
                                        <span
                                            key={x.id}
                                            data-cro-id="hp-categories-icons"
                                            className="h-40 px-4"
                                        >
                                            <Link
                                                className="flex flex-col items-center user-select-none w-full"
                                                href={x.href}
                                            >
                                                <div
                                                    className="flex items-center justify-center"
                                                    style={{ width: size, height: size, lineHeight: 0 }}
                                                    aria-hidden="false"
                                                    aria-label={x.title}
                                                >
                                                    {x.imageUrl ? (
                                                        <img
                                                            className="w-full h-full inline-block"
                                                            src={resolveMediaUrl(x.imageUrl)}
                                                            width={size}
                                                            height={size}
                                                            alt={x.title}
                                                            title=""
                                                            style={{ objectFit: "contain" }}
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full rounded-full bg-slate-100 border border-slate-200" />
                                                    )}
                                                </div>

                                                <p className="text-body2-strong text-neutral-900 mt-2 text-center ellipsis-2 line-clamp-2">
                                                    {x.title}
                                                </p>
                                            </Link>
                                        </span>
                                    ))}
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

            </div>
        </div>
    );
}
