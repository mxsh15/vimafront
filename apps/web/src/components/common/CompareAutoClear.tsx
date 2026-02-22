"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { clearCompareState } from "@/modules/compare/storage";

export default function CompareAutoClear() {
    const pathname = usePathname();
    const prev = useRef<string | null>(null);

    useEffect(() => {
        const prevPath = prev.current;
        const current = pathname ?? "";
        
        if (prevPath === "/compare" && current !== "/compare") {
            clearCompareState();
        }

        prev.current = current;
    }, [pathname]);

    return null;
}