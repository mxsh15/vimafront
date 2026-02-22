"use client";

import Link from "next/link";
import {
    CircleUser,
    Dot,
    MoreVertical,
    Star,
    Store,
    ThumbsDown,
    ThumbsUp,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { voteReview } from "@/modules/review/api";

export type PdpComment = {
    id: string;
    userDisplayName?: string | null;
    isBuyer?: boolean | null;
    createdAt?: string | null;
    createdAtFa?: string | null;
    rating?: number | null;
    text?: string | null;
    vendorName?: string | null;
    vendorSlug?: string | null;
    likeCount?: number | null;
    dislikeCount?: number | null;
};

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

function toFaNumber(n: number) {
    return Number(n || 0).toLocaleString("fa-IR");
}

function formatDateFa(c: PdpComment) {
    if (c.createdAtFa) return c.createdAtFa;
    const s = (c.createdAt ?? "").trim();
    if (!s) return "";
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(d);
}

function renderStars(rating?: number | null) {
    const r = clamp(Math.round(Number(rating ?? 0)), 0, 5);
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

export default function PdpCommentsList({
    comments,
}: {
    comments?: PdpComment[] | null;
}) {
    const items = useMemo(() => comments ?? [], [comments]);
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [pending, startTransition] = useTransition();
    const [local, setLocal] = useState<
        Record<string, { like: number; dislike: number; vote: number }>
    >({});


    if (!items.length) {
        return (
            <div className="rounded-[20px] border border-[#e5e7eb] p-4 text-sm text-[#6b7280]">
                هنوز دیدگاهی برای این کالا ثبت نشده است.
            </div>
        );
    }

    return (
        <div>
            {items.map((c) => {
                const name = (c.userDisplayName ?? "کاربر ناشناس").trim() || "کاربر ناشناس";
                const date = formatDateFa(c);
                const text = (c.text ?? "").trim();
                const vendorName = (c.vendorName ?? "").trim();
                const state = local[c.id] ?? {
                    like: Number(c.likeCount ?? 0),
                    dislike: Number(c.dislikeCount ?? 0),
                    vote: 0,
                };
                const likeCount = state.like;
                const dislikeCount = state.dislike;
                const myVote = state.vote;
                const onVote = (v: 1 | -1) => {
                    if (!isAuthenticated) {
                        router.push("/login");
                        return;
                    }
                    const nextValue: 1 | -1 | 0 = myVote === v ? 0 : v;
                    startTransition(async () => {
                        const res = await voteReview(c.id, nextValue);
                        setLocal((prev) => ({
                            ...prev,
                            [c.id]: { like: res.likeCount, dislike: res.dislikeCount, vote: res.userVote },
                        }));
                    });
                };


                return (
                    <article
                        key={c.id}
                        className="lg:mt-0 py-3 br-list-vertical-no-padding-200 border-b border-b-[var(--color-neutral-100)] last:border-b-0"
                    >
                        {/* header + body */}
                        <div className="w-full flex justify-between">
                            <div className="w-full">
                                <div className="flex items-start w-full mt-1">
                                    <div className="flex flex-col gap-2 grow">
                                        <div className="flex justify-between items-center lg:items-stretch lg:ml-3">
                                            {/* user */}
                                            <div className="flex items-center min-w-0">
                                                <div className="shrink-0 mt-1 grow-0 w-[40px] h-[40px] rounded-[20px] leading-none flex items-center justify-center">
                                                    <CircleUser
                                                        size={30}
                                                        className="rounded-[20px] text-[var(--color-icon-warning)]"
                                                    />
                                                </div>

                                                <div className="mr-2 min-w-0">
                                                    <div className="flex items-center min-w-0">
                                                        <p className="text-body1-strong-compact text-neutral-650 whitespace-nowrap truncate overflow-hidden">
                                                            {name}
                                                        </p>

                                                        {c.isBuyer ? (
                                                            <>
                                                                <div className="flex">
                                                                    <Dot size={20} className="text-[var(--color-neutral-200)]" />
                                                                </div>
                                                                <div
                                                                    className="inline-flex items-center border-none px-2 text-caption-strong
                                             bg-[rgba(76,175,80,0.1)]
                                             text-[var(--color-hint-text-success)]
                                             rounded-lg"
                                                                >
                                                                    <span className="inline-block text-caption-strong">خریدار</span>
                                                                </div>
                                                            </>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* meta */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                {date ? (
                                                    <div className="text-caption text-[var(--color-dark-neutral-500)] whitespace-nowrap [font-family:var(--font-iransans)]">
                                                        {date}
                                                    </div>
                                                ) : null}

                                                <button type="button" className="p-1">
                                                    <span className="flex">
                                                        <MoreVertical size={20} className="text-[var(--color-icon-low-emphasis)]" />
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* rating + text */}
                                        <div className="flex gap-1 flex-col">
                                            <div className="flex items-center">{renderStars(c.rating)}</div>

                                            {text ? (
                                                <p className="text-body-1 text-neutral-900 mb-1 break-words">{text}</p>
                                            ) : (
                                                <p className="text-body-2 text-neutral-500 mb-1">
                                                    متن دیدگاه ثبت نشده است.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* footer: vendor + votes */}
                        <div className="w-full flex flex-row mt-2 justify-between items-center">
                            <div className="flex flex-col justify-between">
                                {vendorName ? (
                                    <div className="flex items-center">
                                        <Link
                                            className="flex items-center"
                                            href={c.vendorSlug ? `/vendor/${c.vendorSlug}` : "#"}
                                        >
                                            <div className="flex text-neutral-700 ml-2">
                                                <Store size={18} className="text-[var(--color-icon-high-emphasis)]" />
                                            </div>
                                            <p className="text-caption text-neutral-850 inline">{vendorName}</p>
                                        </Link>
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex items-center text-neutral-500 pt-1 lg:justify-end mr-auto">
                                <div className="mr-auto lg:mr-0 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => onVote(1)}
                                        disabled={pending}
                                        className="relative flex items-center user-select-none
  text-button-2 rounded-medium px-2 text-neutral-650
  cursor-pointer border-0 bg-transparent outline-none disabled:opacity-60"
                                        aria-label="مفید بود"
                                    >
                                        <div className="flex items-center justify-center relative grow">
                                            <p className="lg:text-caption text-caption-compact">{toFaNumber(likeCount)}</p>
                                            <div className="flex mr-1">
                                                <ThumbsUp
                                                    size={18}
                                                    className={[
                                                        "text-[var(--color-icon-high-emphasis)]",
                                                        myVote === 1 ? "fill-[var(--color-icon-high-emphasis)]" : "fill-transparent",
                                                    ].join(" ")}
                                                />
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onVote(-1)}
                                        disabled={pending}
                                        className="relative flex items-center user-select-none
  text-button-2 rounded-medium px-2 text-neutral-650
  cursor-pointer border-0 bg-transparent outline-none disabled:opacity-60"
                                        aria-label="مفید نبود"
                                    >
                                        <div className="flex items-center justify-center relative grow">
                                            <p className="lg:text-caption text-caption-compact">{toFaNumber(dislikeCount)}</p>
                                            <div className="flex mr-1">
                                                <ThumbsDown
                                                    size={18}
                                                    className={[
                                                        "text-[var(--color-icon-high-emphasis)]",
                                                        myVote === -1 ? "fill-[var(--color-icon-high-emphasis)]" : "fill-transparent",
                                                    ].join(" ")}
                                                />
                                            </div>
                                        </div>
                                    </button>

                                </div>
                            </div>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
