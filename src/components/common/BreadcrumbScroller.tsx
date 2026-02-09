"use client";

import Link from "next/link";
import { useId, useMemo } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import { FreeMode } from "swiper/modules";

type Crumb = { title: string; href: string | null };

export function BreadcrumbScroller({ items }: { items: Crumb[] }) {
    const uid = useId().replace(/:/g, "");
    const nextSel = `breadcrumb-next-${uid}`;
    const prevSel = `breadcrumb-prev-${uid}`;

    const canScroll = useMemo(() => (items?.length ?? 0) > 2, [items?.length]);

    return (
        <div>
            <div className="swiper swiper-initialized swiper-horizontal swiper-free-mode swiper-rtl swiper-backface-hidden">
                <Swiper
                    modules={[FreeMode]}
                    freeMode
                    slidesPerView="auto"
                    spaceBetween={0}
                    dir="rtl"
                    className="swiper"
                    navigation={
                        canScroll
                            ? {
                                nextEl: `.${nextSel}`,
                                prevEl: `.${prevSel}`,
                            }
                            : false
                    }
                >
                    {items.map((c, idx) => {
                        const isLast = idx === items.length - 1;

                        return (
                            <SwiperSlide key={idx} style={{ width: "auto", height: "auto" }}>
                                {c.href && !isLast ? (
                                    <Link
                                        href={c.href}
                                        className="text-[#81858b] text-[12px] shrink-0 hover:text-[#62666d]"
                                        data-cro-id="pdp-breadcrumb-up"
                                    >
                                        {c.title}
                                        <span className="mx-3 text-[#c0c2c5]">/</span>
                                    </Link>
                                ) : (
                                    <span
                                        className="inline text-[#000] text-[12px] shrink-0 max-w-[60vw] lg:max-w-none truncate"
                                        title={c.title}
                                    >
                                        {c.title}
                                    </span>
                                )}
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </div>
        </div>
    );
}
