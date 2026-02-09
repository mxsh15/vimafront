"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { resolveMediaUrl } from "@/modules/media/resolve-url";

type BannerItem = { imageUrl: string; alt?: string | null; href?: string | null };

export function BannerGridFromConfig(props: {
    boxed?: boolean;
    columns?: number;
    gap?: number; 
    items: BannerItem[];
}) {
    const items = props.items?.filter((x) => x?.imageUrl) ?? [];
    if (!items.length) return null;

    const desktopCols = Math.max(1, Math.min(12, Math.floor(props.columns ?? 4)));
    const gap = Math.max(0, Math.min(32, Math.floor(props.gap ?? 16)));

    const wrapClass = props.boxed
        ? "w-full max-w-[1336px] mx-auto px-4 2xl:px-0"
        : "w-full";

    const [isMdUp, setIsMdUp] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(min-width: 768px)");
        const onChange = () => setIsMdUp(mq.matches);
        onChange();
        mq.addEventListener?.("change", onChange);
        return () => mq.removeEventListener?.("change", onChange);
    }, []);

    const cols = isMdUp ? desktopCols : 2;
    const widthMinusPx = (gap * (cols - 1)) / cols;

    function getItemStyle(index: number): React.CSSProperties {
        const isFirstInRow = index % cols === 0;

        return {
            width: `calc(${100 / cols}% - ${widthMinusPx}px)`,
            marginRight: isFirstInRow ? 0 : gap,
            marginTop: 0,
        };
    }

    const itemClass = "w-full block relative"; 
    const imgWrapClass = "h-full"; 
    const imgStyle: React.CSSProperties = {
        objectFit: "cover",
        borderRadius: 16,
    };

    return (
        <div className={`${wrapClass} mb-8`}>
            <div className="flex flex-wrap">
                {items.map((banner, i) => {
                    const href = (banner.href ?? "").trim();
                    const alt = (banner.alt ?? "").trim();

                    const content = (
                        <div>
                            <div
                                className={imgWrapClass}
                                aria-hidden="false"
                                aria-label={alt}
                                style={{ borderRadius: 16, lineHeight: 0 }}
                            >
                                <img
                                    className="w-full h-full inline-block"
                                    src={resolveMediaUrl(banner.imageUrl)}
                                    alt={alt}
                                    title={alt}
                                    loading="lazy"
                                    style={imgStyle}
                                />
                            </div>
                        </div>
                    );

                    return href ? (
                        <Link
                            key={banner.imageUrl + i}
                            href={href}
                            className={itemClass}
                            style={getItemStyle(i)}
                        >
                            {content}
                        </Link>
                    ) : (
                        <div
                            key={banner.imageUrl + i}
                            className={itemClass}
                            style={getItemStyle(i)}
                        >
                            {content}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
