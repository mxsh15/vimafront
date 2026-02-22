"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TabItem = {
    id: string;
    title: string;
};

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

export default function PdpStickyTabs({
    tabs,
    stickyTop = 0,
}: {
    tabs: TabItem[];
    stickyTop?: number;
}) {
    const [activeId, setActiveId] = useState<string>(tabs[0]?.id ?? "");
    const [isStuck, setIsStuck] = useState(false);

    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const barRef = useRef<HTMLDivElement | null>(null);
    const rootMargin = useMemo(() => {
        const top = -(stickyTop + 96);
        const bottom = -60;
        return `${top}px 0px ${bottom}px 0px`;
    }, [stickyTop]);

    useEffect(() => {
        if (!tabs.length) return;

        const sections = tabs
            .map((t) => document.getElementById(t.id))
            .filter(Boolean) as HTMLElement[];

        const io = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .map((e) => e.target as HTMLElement);

                if (!visible.length) return;

                visible.sort((a, b) => {
                    const ay = a.getBoundingClientRect().top;
                    const by = b.getBoundingClientRect().top;
                    return Math.abs(ay - (stickyTop + 80)) - Math.abs(by - (stickyTop + 80));
                });

                setActiveId(visible[0].id);
            },
            { root: null, threshold: 0.01, rootMargin }
        );

        sections.forEach((s) => io.observe(s));
        return () => io.disconnect();
    }, [tabs, rootMargin, stickyTop]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;

        const io = new IntersectionObserver(
            (entries) => {
                setIsStuck(!entries[0].isIntersecting);
            },
            { threshold: 0, rootMargin: `-${stickyTop + 1}px 0px 0px 0px` }
        );

        io.observe(el);
        return () => io.disconnect();
    }, [stickyTop]);

    function getHeaderH() {
        const v = getComputedStyle(document.documentElement)
            .getPropertyValue("--public-header-h")
            .trim();
        const n = parseInt(v || "0", 10);
        return Number.isFinite(n) ? n : 0;
    }

    function scrollTo(id: string) {
        const section = document.getElementById(id);
        if (!section) return;

        const headerH = getHeaderH();
        const tabsTopGap = 8;
        const tabsH = 48;
        const offset = headerH + tabsTopGap + tabsH;

        const y = window.scrollY + section.getBoundingClientRect().top - offset;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    }


    return (
        <>
            <div ref={sentinelRef} />

            <div
                ref={barRef}
                data-pdp-sticky-tabs=""
                className={[
                    "mt-5 w-full sticky z-[40] bg-[var(--color-neutral-000)] transition-[box-shadow,border-color] duration-200",
                    isStuck ? "border-b border-b-[var(--color-neutral-200)]" : "border-b border-transparent",
                ].join(" ")}
                style={{ top: "calc(var(--public-header-h, 0px) + 8px)" }}
            >
                <ul className="flex relative w-full overflow-x-auto hide-scrollbar border-b border-b-[var(--color-neutral-200)]">
                    {tabs.map((t) => {
                        const isActive = t.id === activeId;
                        return (
                            <li key={t.id} className="min-w-fit">
                                <button
                                    type="button"
                                    onClick={() => scrollTo(t.id)}
                                    className={[
                                        "relative px-4 py-3 flex flex-row items-center justify-center",
                                        "lg:grow-0 text-subtitle cursor-pointer text-body2-strong",
                                        "min-w-fit max-w-[300px] lg:max-w-[400px] overflow-hidden",
                                        isActive ? "text-[var(--color-primary-700)]" : "text-neutral-500",
                                    ].join(" ")}
                                >
                                    {t.title}

                                    <span
                                        className={[
                                            "absolute left-3 right-3 -bottom-[1px] h-[3px] rounded-full transition-opacity duration-200",
                                            "bg-[var(--color-primary-700)]",
                                            isActive ? "opacity-100" : "opacity-0",
                                        ].join(" ")}
                                        aria-hidden="true"
                                    />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </>
    );
}
