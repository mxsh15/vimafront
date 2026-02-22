"use client";

import Link from "next/link";
import { useRef } from "react";
import {
    Truck,
    Headset,
    Banknote,
    RefreshCcw,
    BadgeCheck,
} from "lucide-react";

type Item = {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
};

const items: Item[] = [
    { href: "/faq/question/79/", label: "امکان تحویل اکسپرس", icon: Truck },
    { href: "/faq/question/80/", label: "24 ساعته، 7 روز هفته", icon: Headset },
    { href: "/faq/question/81/", label: "امکان پرداخت در محل", icon: Banknote },
    { href: "/faq/question/83/", label: "هفت روز ضمانت بازگشت کالا", icon: RefreshCcw },
    { href: "/faq/question/82/", label: "ضمانت اصل بودن کالا", icon: BadgeCheck },
];

export function PdpSomeInfoNoSwiper() {
    const scrollerRef = useRef<HTMLDivElement | null>(null);

    function scrollBySlide(dir: 1 | -1) {
        const el = scrollerRef.current;
        if (!el) return;

        const slide = el.querySelector<HTMLElement>("[data-slide]");
        const slideWidth = slide?.getBoundingClientRect().width ?? 274;
        const gap = 24;

        el.scrollBy({ left: dir * (slideWidth + gap), behavior: "smooth" });
    }

    return (
        <div className="w-full flex gap-y-4 lg:gap-y-2 mx-auto justify-between">
            <div className="relative w-full">
                <div
                    ref={scrollerRef}
                    className="flex overflow-x-auto overscroll-x-contain scroll-smooth
    [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
    snap-x snap-mandatory
    gap-6
          "
                >
                    {items.map((it) => {
                        const Icon = it.icon;

                        return (
                            <div
                                key={it.href}
                                className="shrink-0 snap-start w-[80vw] sm:w-[340px] lg:w-[273.6px]"
                            >
                                <Link
                                    href={it.href}
                                >
                                    <div className="flex flex-col lg:flex-row items-center justify-center px-1">
                                        <div
                                            className="lg:inline-block pt-1 w-[40px] h-[40px] leading-none flex items-center justify-center"
                                            aria-hidden="false"
                                            aria-label={it.label}
                                        >
                                            <Icon
                                                size={28}
                                                className="text-neutral-400 font-normal"
                                            />
                                        </div>

                                        <p className="text-center text-caption-strong text-neutral-400">
                                            {it.label}
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>

                <button
                    type="button"
                    className="hidden lg:flex justify-center items-center bg-neutral-000 absolute cursor-pointer z-5 rounded-circle styles_ScrollHorizontalWrapper__button__uMRet styles_ScrollHorizontalWrapper__button--next__0VY_Y"
                    onClick={() => scrollBySlide(1)}
                    aria-label="بعدی"
                    title="بعدی"
                >
                    <div className="flex" aria-hidden="false">
                        <svg
                            style={{ width: 24, height: 24, fill: "var(--color-icon-high-emphasis)" }}
                        >
                            <use xlinkHref="#chevronLeft" />
                        </svg>
                    </div>
                </button>

                <button
                    type="button"
                    className="hidden lg:flex justify-center items-center bg-neutral-000 absolute cursor-pointer z-5 rounded-circle styles_ScrollHorizontalWrapper__button__uMRet styles_ScrollHorizontalWrapper__button--prev___Vx1r"
                    onClick={() => scrollBySlide(-1)}
                    aria-label="قبلی"
                    title="قبلی"
                >
                    <div className="flex" aria-hidden="false">
                        <svg
                            style={{ width: 24, height: 24, fill: "var(--color-icon-high-emphasis)" }}
                        >
                            <use xlinkHref="#chevronRight" />
                        </svg>
                    </div>
                </button>
            </div>
        </div>
    );
}
