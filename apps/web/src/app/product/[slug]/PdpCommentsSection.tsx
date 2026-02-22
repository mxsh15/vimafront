"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { ArrowDownWideNarrow, Info, Star } from "lucide-react";
import PdpCommentsList, { type PdpComment } from "./PdpCommentsList";

type SortKey = "newest" | "buyers" | "helpful";

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

function toFaNumber(n: number) {
    return Number(n || 0).toLocaleString("fa-IR");
}

function formatRatingFa(n: number | null | undefined) {
    const x = Number(n ?? 0);
    if (!Number.isFinite(x) || x <= 0) return "0";
    if (Math.floor(x) === x) return x.toLocaleString("fa-IR", { maximumFractionDigits: 0 });
    return x.toLocaleString("fa-IR", { maximumFractionDigits: 1 });
}

function renderStarsSummary(avg: number) {
    const r = clamp(Math.round(Number(avg ?? 0)), 0, 5);

    return (
        <div className="inline-flex flex-nowrap relative gap-x-0.5">
            {Array.from({ length: 5 }).map((_, i) => {
                const filled = i < r;
                return (
                    <span key={i} className="inline-flex">
                        <Star
                            size={20}
                            className={[
                                "text-[var(--color-icon-warning,#f9a825)]",
                                filled ? "fill-[var(--color-icon-warning,#f9a825)]" : "fill-transparent",
                            ].join(" ")}
                        />
                    </span>
                );
            })}
        </div>
    );
}

function sortComments(items: PdpComment[], sort: SortKey) {
    const arr = [...items];

    if (sort === "buyers") {
        return arr
            .filter(x => !!x.isBuyer)
            .sort((a, b) => {
                const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return tb - ta;
            });
    }

    if (sort === "helpful") {
        return arr.sort((a, b) => {
            const al = Number(a.likeCount ?? 0);
            const bl = Number(b.likeCount ?? 0);
            const ad = Number(a.dislikeCount ?? 0);
            const bd = Number(b.dislikeCount ?? 0);

            const as = al - ad;
            const bs = bl - bd;

            if (bs !== as) return bs - as;
            if (bl !== al) return bl - al;

            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tb - ta;
        });
    }

    // newest
    return arr.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
    });
}

export default function PdpCommentsSection({
    ratingAverage,
    ratingCount,
    commentsCount,
    comments,
    sort: initialSort = "newest",
    onSubmitHref = "#",
    submitSlot,
}: {
    ratingAverage?: number | null;
    ratingCount?: number | null;
    commentsCount?: number | null;
    comments?: PdpComment[] | null;
    sort?: SortKey;
    onSubmitHref?: string;
    submitSlot?: ReactNode;
}) {
    const avg = Number(ratingAverage ?? 0);
    const rateCount = Number(ratingCount ?? 0);
    const list = (comments ?? []).filter(Boolean);
    const effectiveCommentsCount = Number.isFinite(Number(commentsCount)) ? Number(commentsCount) : list.length;
    const [sort, setSort] = useState<SortKey>(initialSort);
    const sorted = useMemo(() => sortComments(list, sort), [list, sort]);
    const [pending, startTransition] = useTransition();
    const [sortLoading, setSortLoading] = useState(false);
    useEffect(() => {
        console.log("sort:", sort, "ids:", sorted.map(x => x.id));
    }, [sort, sorted]);

    const SortBtn = ({ k, label }: { k: SortKey; label: string }) => {
        const active = sort === k;
        return (
            <button
                type="button"
                onClick={() => {
                    if (sort === k) return;
                    setSortLoading(true);
                    setSort(k);
                    window.setTimeout(() => setSortLoading(false), 250);
                }}
                disabled={sortLoading}
                className={[
                    "whitespace-nowrap text-body-2 transition-colors",
                    active
                        ? "text-[var(--color-hint-object-error)]"
                        : "text-neutral-500 hover:text-neutral-700",
                    pending ? "opacity-60" : "",
                ].join(" ")}
            >
                {label}
            </button>
        );
    };

    return (
        <section>
            <div className="lg:mt-4 pb-3 w-screen lg:w-auto lg:border-b-[4px] lg:border-b-[var(--color-neutral-100)]">
                <div className="break-words py-3">
                    <div className="flex items-center grow">
                        <p className="grow text-h5">
                            <span className="relative">امتیاز و دیدگاه کاربران</span>
                        </p>
                    </div>
                    <div className="mt-2 w-[4rem] h-[.1rem] bg-[var(--color-primary-700)]" />
                </div>

                <div className="flex justify-start items-start mt-3">
                    <aside className="hidden lg:block ml-12 mt-4 left-0 sticky min-w-[260px] w-[260px]">
                        <div className="flex items-center">
                            <p className="text-[1.8rem] ml-1 leading-none font-semibold">
                                {formatRatingFa(avg)}
                            </p>
                            <p className="text-[.8rem]">از 5</p>
                        </div>

                        <div className="flex items-center mt-3">
                            {renderStarsSummary(avg)}
                            <p className="text-[var(--color-neutral-400)] text-[.6rem] mr-2">
                                از مجموع {toFaNumber(rateCount)} امتیاز
                            </p>
                        </div>

                        <p className="text-neutral-700 mt-4 mb-3 text-caption [font-family:var(--font-iransans)]">
                            شما هم درباره این کالا دیدگاه ثبت کنید
                        </p>

                        {submitSlot ?? (
                            <Link
                                href={onSubmitHref}
                                className="relative flex items-center user-select-none text-button-2
                rounded-md w-full mt-2 [font-family:var(--font-iransans)]
                text-[var(--color-button-primary)] px-[16px] py-[8px]
                border border-[var(--color-button-primary)]
                outline-none overflow-hidden cursor-pointer
                transition-[top] duration-300 ease-in-out h-[40px]"
                            >
                                <span className="flex items-center justify-center relative grow">ثبت دیدگاه</span>
                            </Link>
                        )}

                        <div className="rounded mt-3">
                            <div className="flex">
                                <div className="flex mt-1">
                                    <Info size={18} className="text-[var(--color-icon-neutral-hint)]" />
                                </div>
                                <p className="text-neutral-600 text-body-2 mr-2">
                                    با ثبت دیدگاه بر روی کالاهای خریداری شده ۵ امتیاز در سایت دریافت کنید
                                </p>
                            </div>
                        </div>
                    </aside>

                    <div className="grow min-w-0">
                        <div className="flex flex-row items-center gap-x-4">
                            <div className="break-words py-3">
                                <div className="flex items-center grow">
                                    <div className="flex shrink-0 ml-2">
                                        <ArrowDownWideNarrow
                                            size={20}
                                            className="text-[var(--color-icon-high-emphasis)]"
                                        />
                                    </div>
                                    <p className="grow whitespace-nowrap text-neutral-700 text-body2-strong">
                                        <span className="relative">مرتب سازی:</span>
                                    </p>
                                </div>
                            </div>

                            <div className="contents [font-family:var(--font-iransans)]">
                                <SortBtn k="newest" label="جدیدترین" />
                                <SortBtn k="buyers" label="دیدگاه خریداران" />
                                <SortBtn k="helpful" label="مفیدترین" />
                            </div>

                            <div className="mr-auto block">
                                <span className="text-neutral-500 whitespace-nowrap text-body-2 xl:flex items-center gap-2 [font-family:var(--font-iransans)]">
                                    {toFaNumber(effectiveCommentsCount)} دیدگاه
                                </span>
                            </div>
                        </div>

                        <div>
                            <div className="relative">
                                {sortLoading ? (
                                    <div className="absolute inset-0 z-10 rounded-[16px] bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
                                        <div className="flex items-center gap-2 text-body-2 text-neutral-700">
                                            <span className="inline-block w-4 h-4 rounded-full border border-neutral-300 border-t-transparent animate-spin" />
                                            در حال مرتب‌سازی…
                                        </div>
                                    </div>
                                ) : null}

                                <div className={sortLoading ? "pointer-events-none opacity-60" : ""}>
                                    <PdpCommentsList comments={sorted} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
