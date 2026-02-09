"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, Grid3X3 } from "lucide-react";
import { resolveMediaUrl } from "@/modules/media/resolve-url";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";

type TabKey = "official" | "buyers" | "magnet";

export default function ProductGalleryModal(props: {
    open: boolean;
    onClose: () => void;
    title: string;
    images: string[];
    initialIndex?: number;
}) {
    const { open, onClose, title, images } = props;

    const [tab, setTab] = useState<TabKey>("official");
    const [index, setIndex] = useState(() => props.initialIndex ?? 0);

    const safeImages = useMemo(() => (images ?? []).filter(Boolean), [images]);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const swiperRef = useRef<SwiperType | null>(null);

    const prevBtnRef = useRef<HTMLButtonElement | null>(null); // سمت راست (قبلی)
    const nextBtnRef = useRef<HTMLButtonElement | null>(null); // سمت چپ (بعدی)

    const portalRoot =
        typeof document !== "undefined" ? document.getElementById("modal-root") : null;

    // قفل اسکرول + ESC
    useEffect(() => {
        if (!open) return;

        document.body.classList.add("no-scroll");

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (tab !== "official") return;
            if (e.key === "ArrowLeft") swiperRef.current?.slideNext();
            if (e.key === "ArrowRight") swiperRef.current?.slidePrev();
        };

        window.addEventListener("keydown", onKeyDown);
        setTimeout(() => containerRef.current?.focus(), 0);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            document.body.classList.remove("no-scroll");
        };
    }, [open, onClose, tab]);

    // وقتی مودال باز می‌شود روی index درست برو
    useEffect(() => {
        if (!open) return;
        const nextIndex = Math.max(0, Math.min(safeImages.length - 1, props.initialIndex ?? 0));
        setIndex(nextIndex);
        if (swiperRef.current && safeImages.length) {
            swiperRef.current.slideTo(nextIndex, 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, props.initialIndex, safeImages.length]);

    // ✅ اتصال/اتصال مجدد navigation
    // چون دکمه‌ها شرطی رندر می‌شوند، با تغییر index باید دوباره nav رو bind کنیم.
    useEffect(() => {
        if (!open) return;
        if (tab !== "official") return;

        const sw = swiperRef.current;
        if (!sw) return;

        const prevEl = prevBtnRef.current;
        const nextEl = nextBtnRef.current;

        // اگر یکی از دکمه‌ها نیست (مثلاً اول/آخر)، nav را با همان موجود bind کن.
        // Swiper با null هم کنار میاد ولی ما bind را هر بار تازه می‌کنیم.
        // @ts-expect-error
        sw.params.navigation = {
            prevEl,
            nextEl,
            disabledClass: "swiper-button-disabled",
        };

        // @ts-expect-error
        sw.navigation?.destroy?.();
        // @ts-expect-error
        sw.navigation?.init?.();
        // @ts-expect-error
        sw.navigation?.update?.();
    }, [open, tab, index]);

    if (!open || !portalRoot) return null;

    const hasSlides = tab === "official" && safeImages.length > 0;
    const hasMany = tab === "official" && safeImages.length > 1;

    const isFirst = index <= 0;
    const isLast = index >= safeImages.length - 1;

    // شرط نمایش:
    // - دکمه سمت راست (قبلی) وقتی هست که اول نباشیم
    // - دکمه سمت چپ (بعدی) وقتی هست که آخر نباشیم
    const showPrevRight = hasMany && !isFirst;
    const showNextLeft = hasMany && !isLast;

    return createPortal(
        <div
            className="fixed inset-0 z-[80] bg-black/90"
            role="dialog"
            aria-modal="true"
            aria-label="گالری محصول"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div ref={containerRef} tabIndex={-1} className="h-full outline-none">
                {/* Header */}
                <div className="relative z-10 flex items-center justify-center px-4 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="بستن"
                        className="absolute left-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="relative flex h-[calc(100%-140px)] items-center justify-center px-4">
                    <div className="relative w-full max-w-[920px]">
                        <div className="rounded-2xl bg-white">
                            <div className="relative aspect-square sm:aspect-[4/3] w-full overflow-hidden rounded-2xl">
                                {!hasSlides ? (
                                    <div className="flex h-full w-full items-center justify-center text-sm text-slate-600">
                                        تصویر موجود نیست
                                    </div>
                                ) : (
                                    <>
                                        <Swiper
                                            modules={[Navigation]}
                                            spaceBetween={0}
                                            className="h-full w-full"
                                            slidesPerView={1}
                                            initialSlide={Math.max(
                                                0,
                                                Math.min(safeImages.length - 1, props.initialIndex ?? 0)
                                            )}
                                            navigation={{
                                                prevEl: prevBtnRef.current,
                                                nextEl: nextBtnRef.current,
                                                disabledClass: "swiper-button-disabled",
                                            }}
                                            onSwiper={(sw) => {
                                                swiperRef.current = sw;
                                                const start = Math.max(
                                                    0,
                                                    Math.min(safeImages.length - 1, props.initialIndex ?? 0)
                                                );
                                                sw.slideTo(start, 0);
                                            }}
                                            onSlideChange={(sw) => setIndex(sw.activeIndex)}

                                        >
                                            {safeImages.map((u, i) => (
                                                <SwiperSlide key={u + i} className="!w-full h-full">
                                                    <div className="flex items-center justify-center h-full w-full">
                                                        <div className="gallery-fullslider-slide relative h-full max-h-[100vh] bg-black overflow-hidden flex items-center justify-center">
                                                            <img
                                                                src={resolveMediaUrl(u)}
                                                                alt={title}
                                                                draggable={false}
                                                                className="w-full h-full object-contain bg-black select-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </SwiperSlide>
                                            ))}

                                        </Swiper>

                                        {/* ✅ Navigation شرطی */}
                                        {showNextLeft ? (
                                            <button
                                                ref={nextBtnRef}
                                                type="button"
                                                aria-label="بعدی"
                                                className="hidden lg:inline-flex absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-white shadow z-30 pointer-events-auto"
                                            >
                                                <ChevronLeft className="h-5 w-5 text-slate-800" />
                                            </button>
                                        ) : (
                                            <span className="hidden" />
                                        )}

                                        {showPrevRight ? (
                                            <button
                                                ref={prevBtnRef}
                                                type="button"
                                                aria-label="قبلی"
                                                className="hidden lg:inline-flex absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-white shadow z-30 pointer-events-auto"
                                            >
                                                <ChevronRight className="h-5 w-5 text-slate-800" />
                                            </button>
                                        ) : (
                                            <span className="hidden" />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer thumbnails */}
                <div className="relative z-10 flex items-center gap-3 px-4 pb-5">
                    <div className="flex-1 overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-2">
                            {safeImages.map((u, i) => {
                                const selected = i === index;
                                return (
                                    <button
                                        key={u + i}
                                        type="button"
                                        onClick={() => swiperRef.current?.slideTo(i)}
                                        className={
                                            "relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-white" +
                                            (selected ? " ring-2 ring-white" : " opacity-90 hover:opacity-100")
                                        }
                                        aria-label={`تصویر ${i + 1}`}
                                    >
                                        <img
                                            src={resolveMediaUrl(u)}
                                            alt={title}
                                            className="h-full w-full object-cover select-none"
                                            draggable={false}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        portalRoot
    );
}

function TabButton(props: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={props.onClick}
            className={
                "px-4 py-2 text-sm select-none transition " +
                (props.active ? "bg-white text-slate-900" : "text-white hover:bg-white/10")
            }
        >
            {props.children}
        </button>
    );
}
