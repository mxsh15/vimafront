"use client";

import { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";

type FeatureItem = {
    title?: string | null;
    value?: string | null;
    name?: string | null;
    displayValue?: string | null;
};

function normalizeItems(items: any[]): { title: string; value: string }[] {
    return (items ?? [])
        .map((x: FeatureItem) => {
            const title = (x?.title ?? x?.name ?? "").toString().trim();
            const value = (x?.value ?? x?.displayValue ?? "").toString().trim();
            return { title, value };
        })
        .filter((x) => x.title && x.value);
}

export default function PdpFeaturesToggle({
    items,
    initialCount = 5,
}: {
    items?: any[] | null;
    initialCount?: number;
}) {
    const [expanded, setExpanded] = useState(false);

    const normalized = useMemo(() => normalizeItems(items ?? []), [items]);

    const hasAny = normalized.length > 0;
    const hasMoreThanInitial = normalized.length > initialCount;

    const visible = useMemo(() => {
        if (!hasMoreThanInitial) return normalized;
        return expanded ? normalized : normalized.slice(0, initialCount);
    }, [normalized, expanded, hasMoreThanInitial, initialCount]);

    if (!hasAny) {
        return (
            <p className="text-body-2 text-neutral-500 py-3">
                ویژگی‌ای برای این محصول ثبت نشده است.
            </p>
        );
    }

    return (
        <div>
            {visible.map((f, idx) => {
                const isLastVisible = idx === visible.length - 1;

                return (
                    <div key={`${f.title}-${idx}`} className="w-full flex">
                        <p className="ml-4 text-body-1 text-neutral-500 py-2 lg:py-3 lg:p-2 shrink-0 w-[104px] lg:w-[200px]">
                            {f.title}
                        </p>

                        <div
                            className={[
                                "py-2 lg:py-3 grow",
                                !isLastVisible ? "border-b border-b-[var(--color-neutral-100)]" : "",
                            ].join(" ")}
                        >
                            <p className="flex items-center w-full text-body-1 text-neutral-900 break-words">
                                {f.value}
                            </p>
                        </div>
                    </div>
                );
            })}

            {hasMoreThanInitial && (
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="mt-3 inline-flex items-center cursor-pointer text-button-2 text-[var(--color-icon-secondary)] [font-family:var(--font-iransans)] select-none"
                >
                    <span>{expanded ? "بستن" : "مشاهده بیشتر"}</span>
                    <span className="flex">
                        <ChevronLeft
                            size={15}
                            className={[
                                "text-[var(--color-icon-secondary)] transition-transform"
                            ].join(" ")}
                        />
                    </span>
                </button>
            )}
        </div>
    );
}
