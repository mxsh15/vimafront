"use client";

import Link from "next/link";
import { resolveMediaUrl } from "@/modules/media/resolve-url";

export function FullWidthImageFromConfig(props: {
    imageUrl: string;
    alt?: string;
    href?: string | null;
    fixedHeight?: boolean;
    heightPx?: number;
}) {
    if (!props.imageUrl) return null;

    const img = (
        <img
            src={resolveMediaUrl(props.imageUrl)}
            alt={props.alt ?? ""}
            className={props.fixedHeight ? "w-full object-cover rounded-2xl" : "w-full h-auto object-cover rounded-2xl"}
            style={props.fixedHeight ? { height: props.heightPx ?? 360 } : undefined}
            loading="lazy"
        />
    );

    return (
        <div className="mx-auto px-4">
            {props.href ? (
                <Link href={props.href} className="block w-full">
                    {img}
                </Link>
            ) : (
                img
            )}
        </div>
    );
}
