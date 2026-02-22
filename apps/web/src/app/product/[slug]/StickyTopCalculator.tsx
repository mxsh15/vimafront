"use client";

import { useEffect } from "react";

function readPx(cssValue: string | null | undefined) {
    if (!cssValue) return 0;
    const v = String(cssValue).trim();
    const n = parseFloat(v.replace("px", ""));
    return Number.isFinite(n) ? n : 0;
}

export default function StickyTopCalculator() {
    useEffect(() => {
        let ro: ResizeObserver | null = null;

        const calc = () => {
            const header = document.querySelector<HTMLElement>("[data-site-header]");
            const tabs = document.querySelector<HTMLElement>("[data-pdp-sticky-tabs]");

            const headerH = header
                ? header.getBoundingClientRect().height
                : readPx(getComputedStyle(document.documentElement).getPropertyValue("--public-header-h"));

            const tabsH = tabs ? tabs.getBoundingClientRect().height : 0;
            const tabsTop = Math.ceil(headerH + 8);
            const sidebarTop = Math.ceil(headerH + 8 + tabsH + 12);

            document.documentElement.style.setProperty("--pdp-tabs-top", `${tabsTop}px`);
            document.documentElement.style.setProperty("--pdp-sidebar-top", `${sidebarTop}px`);
            document.documentElement.style.setProperty("--pdp-tabs-h", `${Math.ceil(tabsH)}px`);
        };

        const tick = () => requestAnimationFrame(calc);
        tick();

        ro = new ResizeObserver(() => tick());

        const header = document.querySelector<HTMLElement>("[data-site-header]");
        const tabs = document.querySelector<HTMLElement>("[data-pdp-sticky-tabs]");

        if (header) ro.observe(header);
        if (tabs) ro.observe(tabs);

        window.addEventListener("resize", tick);

        return () => {
            ro?.disconnect();
            window.removeEventListener("resize", tick);
        };
    }, []);

    return null;
}