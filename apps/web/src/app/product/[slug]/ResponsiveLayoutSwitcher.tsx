"use client";

import { useEffect, useState, ReactNode } from "react";

interface Props {
    serverIsMobile: boolean;
    breakpointPx?: number;
    mobileView: ReactNode;
    desktopView: ReactNode;
}

export default function ResponsiveLayoutSwitcher({
    serverIsMobile,
    breakpointPx = 1024,
    mobileView,
    desktopView,
}: Props) {
    const [isMobile, setIsMobile] = useState(serverIsMobile);

    useEffect(() => {
        const mq = window.matchMedia(`(max-width: ${breakpointPx}px)`);
        setIsMobile(mq.matches);
        const onChange = (e: MediaQueryListEvent) => {
            setIsMobile(e.matches);
        };

        mq.addEventListener?.("change", onChange);
        return () => mq.removeEventListener?.("change", onChange);
    }, [breakpointPx]);
    return isMobile ? <>{mobileView}</> : <>{desktopView}</>;
}