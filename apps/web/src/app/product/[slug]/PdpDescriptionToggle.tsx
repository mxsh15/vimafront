"use client";

import { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";

function htmlToText(html: string) {
    if (!html) return "";

    return html
        .replace(/<style[^>]*>.*?<\/style>/gis, "")
        .replace(/<script[^>]*>.*?<\/script>/gis, "")
        .replace(/<[^>]+>/g, " ") // حذف تگ‌ها
        .replace(/&nbsp;/g, " ")
        .replace(/&zwnj;/g, "‌")
        .replace(/&raquo;/g, "»")
        .replace(/&laquo;/g, "«")
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ")
        .trim();
}

function splitWordsFa(text: string) {
    if (!text) return [];
    return text.split(/\s+/).filter(Boolean);
}

function truncateWords(text: string, maxWords: number) {
    const words = splitWordsFa(text);
    if (words.length <= maxWords) return { text, isTruncated: false };
    return { text: words.slice(0, maxWords).join(" "), isTruncated: true };
}

export default function PdpDescriptionToggle({
    descriptionHtml,
    maxWords = 100,
}: {
    descriptionHtml?: string | null;
    maxWords?: number;
}) {
    const [expanded, setExpanded] = useState(false);

    const plainText = useMemo(
        () => htmlToText(descriptionHtml ?? ""),
        [descriptionHtml]
    );

    const truncated = useMemo(
        () => truncateWords(plainText, maxWords),
        [plainText, maxWords]
    );

    const hasLongText = truncated.isTruncated;

    if (!descriptionHtml) {
        return (
            <p className="text-sm text-[var(--color-neutral-800)]">
                توضیحات این محصول ثبت نشده است.
            </p>
        );
    }

    return (
        <div>
            {/* متن */}
            {!hasLongText || expanded ? (
                <div
                    className="text-body-1 text-[var(--color-neutral-800)] leading-7"
                    dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
            ) : (
                <p className="text-body-1 text-[var(--color-neutral-800)] leading-7">
                    {truncated.text}
                    <span className="mr-1">…</span>
                </p>
            )}

            {/* دکمه */}
            {hasLongText && (
                <div className="mt-2 mb-3 pr-0 text-[var(--color-secondary-500)] flex items-center">
                    <button
                        type="button"
                        onClick={() => setExpanded((v) => !v)}
                        className="inline-flex items-center cursor-pointer text-button-2 text-[var(--color-button-secondary)]"
                    >
                        <span className="[font-family:var(--font-iransans)] font-medium">
                            {expanded ? "بستن" : "بیشتر"}
                        </span>

                        <span className="flex">
                            <ChevronLeft
                                size={15}
                                className={[
                                    "text-[var(--color-icon-secondary)] transition-transform"
                                ].join(" ")}
                            />
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}
