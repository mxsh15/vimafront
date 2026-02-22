"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowDownWideNarrow,
    DotIcon,
    FilePenLine,
    ThumbsDown,
    ThumbsUp,
    X,
} from "lucide-react";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";

import SubmitQuestionButton from "./SubmitQuestionButton";
import { useAuth } from "@/context/AuthContext";
import { PublicQuestionDto } from "@/modules/product-qa/types";
import {
    listPublicAnswersByQuestion,
    listPublicQuestions,
    voteProductAnswer,
} from "@/modules/product-qa/api";

type SortKey = "newest" | "answered";

function toFaNumber(n: number) {
    return Number(n || 0).toLocaleString("fa-IR");
}

function toFaDate(s: string) {
    try {
        return new Date(s).toLocaleDateString("fa-IR");
    } catch {
        return "";
    }
}

function SortBtn({
    active,
    label,
    onClick,
}: {
    active: boolean;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "relative flex items-center user-select-none",
                "text-button-2 rounded-medium px-2",
                "border border-transparent",
                active
                    ? "bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]"
                    : "text-neutral-500",
                "transition-colors",
                "[font-family:var(--font-iransans)]",
            ].join(" ")}
        >
            {label}
        </button>
    );
}

type VoteState = { like: number; dislike: number; vote: 1 | -1 | 0 };

export default function ProductQuestionsSection({
    productId,
    productTitle,
    productImageUrl,
}: {
    productId: string;
    productTitle: string;
    productImageUrl?: string | null;
}) {
    const qc = useQueryClient();
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    const [sort, setSort] = useState<SortKey>("newest");
    const [answersDialogOpen, setAnswersDialogOpen] = useState(false);
    const [activeQuestion, setActiveQuestion] = useState<{
        id: string;
        question: string;
        answersCount: number;
    } | null>(null);

    const [pending, startTransition] = useTransition();
    const [localAnswerVotes, setLocalAnswerVotes] = useState<Record<string, VoteState>>(
        {}
    );

    const q = useQuery({
        queryKey: ["public-product-questions", productId, "with-answers"] as const,
        queryFn: () => listPublicQuestions(productId, true),
    });

    const answersQ = useQuery({
        queryKey: ["public-question-answers", activeQuestion?.id] as const,
        queryFn: () => listPublicAnswersByQuestion(activeQuestion!.id),
        enabled: answersDialogOpen && !!activeQuestion?.id,
    });

    const items = useMemo(() => {
        const arr = q.data ?? [];
        if (sort === "answered") {
            return [...arr].sort(
                (a, b) => (b.answersCount ?? 0) - (a.answersCount ?? 0)
            );
        }
        return arr;
    }, [q.data, sort]);

    const getVoteState = (a: {
        id: string;
        likeCount?: number | null;
        dislikeCount?: number | null;
        userVote?: number | null;
    }): VoteState => {
        return (
            localAnswerVotes[a.id] ?? {
                like: Number(a.likeCount ?? 0),
                dislike: Number(a.dislikeCount ?? 0),
                vote: (Number(a.userVote ?? 0) as 1 | -1 | 0),
            }
        );
    };

    const onVoteAnswer = (answerId: string, currentVote: 1 | -1 | 0, v: 1 | -1) => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        const nextValue: 1 | -1 | 0 = currentVote === v ? 0 : v;

        startTransition(async () => {
            const res = await voteProductAnswer(answerId, nextValue);

            setLocalAnswerVotes((prev) => ({
                ...prev,
                [answerId]: {
                    like: Number(res.likeCount ?? 0),
                    dislike: Number(res.dislikeCount ?? 0),
                    vote: (Number(res.userVote ?? 0) as 1 | -1 | 0),
                },
            }));
            qc.invalidateQueries({
                queryKey: ["public-product-questions", productId, "with-answers"],
            });
            if (activeQuestion?.id) {
                qc.invalidateQueries({
                    queryKey: ["public-question-answers", activeQuestion.id],
                });
            }
        });
    };

    const openAnswers = (it: PublicQuestionDto) => {
        setActiveQuestion({
            id: it.id,
            question: it.question,
            answersCount: it.answersCount ?? 0,
        });
        setAnswersDialogOpen(true);
    };

    const closeAnswers = () => {
        setAnswersDialogOpen(false);
        setActiveQuestion(null);
    };

    return (
        <section className="lg:mt-4 pb-3 w-screen lg:w-auto border-b-[4px] border-b-[var(--color-neutral-100)]">
            <div id="questionsSection" className="scroll-mt-24">
                <div className="break-words py-3">
                    <div className="flex items-center grow">
                        <p className="grow text-h5 text-neutral-900">
                            <span className="relative">پرسش ها</span>
                        </p>
                    </div>
                    <div className="mt-2 w-[4rem] h-[.1rem] bg-[var(--color-primary-700)]" />
                </div>
            </div>

            <div className="flex justify-start items-start mt-5">
                {/* sidebar */}
                <div className="sticky px-2 pb-3">
                    <p className="text-[var(--color-neutral-700)] text-[0.7rem] mt-7 mb-5 min-w-[240px]">
                        شما هم درباره این کالا پرسش ثبت کنید
                    </p>

                    <SubmitQuestionButton
                        productId={productId}
                        productTitle={productTitle}
                        productImageUrl={productImageUrl}
                        onSubmitted={() =>
                            qc.invalidateQueries({
                                queryKey: ["public-product-questions", productId, "with-answers"],
                            })
                        }
                    />
                </div>

                {/* list */}
                <div className="w-full mr-10">
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
                            <SortBtn
                                active={sort === "newest"}
                                label="جدیدترین"
                                onClick={() => setSort("newest")}
                            />
                            <SortBtn
                                active={sort === "answered"}
                                label="بیشترین پاسخ"
                                onClick={() => setSort("answered")}
                            />
                        </div>

                        <div className="mr-auto block">
                            <span className="text-neutral-500 whitespace-nowrap text-body-2 xl:flex items-center gap-2 [font-family:var(--font-iransans)]">
                                {toFaNumber(items.length)} پرسش
                            </span>
                        </div>
                    </div>

                    {q.isLoading ? (
                        <div className="py-6 text-body-2 text-neutral-500 [font-family:var(--font-iransans)]">
                            در حال بارگذاری…
                        </div>
                    ) : items.length === 0 ? (
                        <div className="py-6 text-body-2 text-neutral-500 [font-family:var(--font-iransans)]">
                            هنوز پرسشی برای این کالا ثبت نشده است.
                        </div>
                    ) : (
                        <div className="divide-y divide-[var(--color-neutral-100)]">
                            {items.map((it) => (
                                <article
                                    key={it.id}
                                    className="br-list-vertical-no-padding-200 py-2 px-3 w-full"
                                >
                                    <div className="flex items-start">
                                        <p className="text-neutral-850 text-h5-regular-180 w-full py-2">
                                            {it.question}
                                        </p>
                                    </div>

                                    <div>
                                        {/* answers */}
                                        {(it.answers ?? []).length ? (
                                            <div className="flex flex-col">
                                                {(it.answers ?? []).map((a) => {
                                                    const state = getVoteState(a);
                                                    const likeCount = state.like;
                                                    const dislikeCount = state.dislike;
                                                    const myVote = state.vote;

                                                    return (
                                                        <div key={a.id} className="flex flex-col py-4">
                                                            <div className="flex gap-2 items-center">
                                                                <div>
                                                                    <div className="flex flex-nowrap items-center overflow-hidden">
                                                                        <span
                                                                            className="text-neutral-650 text-button-2-compact whitespace-nowrap truncate max-w-[135px]
                                                                            [font-family:var(--font-iransans)]"
                                                                        >
                                                                            {a.vendorStoreName ||
                                                                                a.userFullName ||
                                                                                "پاسخ‌دهنده"}
                                                                        </span>

                                                                        <span>
                                                                            <div className="flex items-center">
                                                                                <div className="flex" aria-hidden="false">
                                                                                    <DotIcon
                                                                                        size={20}
                                                                                        className="text-[var(--color-neutral-200)]"
                                                                                    />
                                                                                </div>

                                                                                {a.vendorStoreName ? (
                                                                                    <div
                                                                                        className="inline-flex items-center border-none px-2 text-caption-strong
                                                                                        [font-family:var(--font-iransans)]"
                                                                                        style={{
                                                                                            backgroundColor:
                                                                                                "rgba(249, 168, 37, 0.1)",
                                                                                            color:
                                                                                                "var(--color-hint-text-caution)",
                                                                                        }}
                                                                                    >
                                                                                        <p
                                                                                            className="inline-block text-caption-strong
                                                                                            [font-family:var(--font-iransans)]"
                                                                                        >
                                                                                            فروشنده
                                                                                        </p>
                                                                                    </div>
                                                                                ) : null}
                                                                            </div>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* body */}
                                                            <div className="mr-12">
                                                                <p className="text-body-1 text-[#5c5c5c] my-1 mr-2">
                                                                    {a.answer}
                                                                </p>

                                                                <div className="flex items-center justify-between w-full text-dark-neutral-000">
                                                                    <span className="text-[var(--color-dark-neutral-600)] whitespace-nowrap truncate text-body-1-180 text-[0.8rem] [font-family:var(--font-iransans)]">
                                                                        {toFaDate(a.createdAtUtc)}
                                                                    </span>

                                                                    {/* votes */}
                                                                    <div className="flex items-center text-neutral-500 pt-0">
                                                                        <div className="mr-auto lg:mr-0 flex items-center">
                                                                            <button
                                                                                type="button"
                                                                                className="relative flex items-center user-select-none text-button-2 
                                                                                rounded-medium px-2 text-neutral-650 disabled:opacity-60 cursor-pointer"
                                                                                title="مفید بود"
                                                                                disabled={pending}
                                                                                onClick={() => onVoteAnswer(a.id, myVote, 1)}
                                                                                data-cro-id="dp-question-like"
                                                                            >
                                                                                <div className="flex items-center justify-center relative grow">
                                                                                    <p className="lg:text-caption text-caption-compact">
                                                                                        {toFaNumber(likeCount)}
                                                                                    </p>
                                                                                    <div className="flex mr-1" aria-hidden="false">
                                                                                        <ThumbsUp
                                                                                            size={18}
                                                                                            className={[
                                                                                                "text-[var(--color-icon-high-emphasis)]",
                                                                                                myVote === 1
                                                                                                    ? "fill-[var(--color-icon-high-emphasis)]"
                                                                                                    : "fill-transparent",
                                                                                            ].join(" ")}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                className="relative flex items-center user-select-none text-button-2 rounded-medium
                                                                                 px-2 text-neutral-650 disabled:opacity-60 cursor-pointer"
                                                                                title="مفید نبود"
                                                                                disabled={pending}
                                                                                onClick={() => onVoteAnswer(a.id, myVote, -1)}
                                                                                data-cro-id="dp-question-dislike"
                                                                            >
                                                                                <div className="flex items-center justify-center relative grow">
                                                                                    <p className="lg:text-caption text-caption-compact">
                                                                                        {toFaNumber(dislikeCount)}
                                                                                    </p>
                                                                                    <div className="flex mr-1" aria-hidden="false">
                                                                                        <ThumbsDown
                                                                                            size={18}
                                                                                            className={[
                                                                                                "text-[var(--color-icon-high-emphasis)]",
                                                                                                myVote === -1
                                                                                                    ? "fill-[var(--color-icon-high-emphasis)]"
                                                                                                    : "fill-transparent",
                                                                                            ].join(" ")}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    {/* /votes */}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                {/* دکمه مشاهده همه پاسخ‌ها */}
                                                {it.answersCount > (it.answers?.length ?? 0) ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => openAnswers(it)}
                                                        className="self-start text-[var(--color-button-secondary)] text-body-2 [font-family:var(--font-iransans)]"
                                                    >
                                                        مشاهده همه پاسخ‌ها ({toFaNumber(it.answersCount)})
                                                    </button>
                                                ) : null}
                                            </div>
                                        ) : null}

                                        {/* footer submit answer button */}
                                        <div className="mt-2">
                                            <button
                                                type="button"
                                                className="relative flex items-center user-select-none text-button-2 rounded-medium text-secondary-500"
                                                onClick={() => {
                                                    window.location.href = "/account";
                                                }}
                                            >
                                                <div className="flex items-center justify-center relative grow">
                                                    <div className="flex ml-2" aria-hidden="false">
                                                        <FilePenLine
                                                            size={16}
                                                            className="text-[var(--color-icon-secondary)]"
                                                        />
                                                    </div>
                                                    ثبت پاسخ
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Dialog: all answers */}
            <Dialog open={answersDialogOpen} onClose={closeAnswers} className="relative z-50">
                <DialogBackdrop className="fixed inset-0 bg-black/30" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-2xl rounded-2xl bg-white p-4 shadow-lg">
                        <div className="flex items-center gap-2">
                            <DialogTitle className="text-sm font-semibold">پاسخ‌ها</DialogTitle>
                            <button
                                type="button"
                                onClick={closeAnswers}
                                className="mr-auto rounded-md p-1 text-neutral-500 hover:bg-[var(--color-neutral-100)]"
                                aria-label="بستن"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <p className="mt-2 text-xs text-slate-600">{activeQuestion?.question}</p>

                        <div className="mt-4">
                            {answersQ.isLoading ? (
                                <div className="text-body-2 text-neutral-500 [font-family:var(--font-iransans)]">
                                    در حال بارگذاری پاسخ‌ها…
                                </div>
                            ) : (answersQ.data ?? []).length === 0 ? (
                                <div className="text-body-2 text-neutral-500 [font-family:var(--font-iransans)]">
                                    پاسخی یافت نشد.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {(answersQ.data ?? []).map((a) => {
                                        const state = getVoteState(a);
                                        const likeCount = state.like;
                                        const dislikeCount = state.dislike;
                                        const myVote = state.vote;

                                        return (
                                            <div
                                                key={a.id}
                                                className="border border-[var(--color-neutral-100)] rounded-md p-3"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-neutral-650 text-button-2-compact truncate max-w-[220px]">
                                                        {a.vendorStoreName || a.userFullName || "پاسخ‌دهنده"}
                                                    </span>

                                                    <div className="flex">
                                                        <DotIcon size={30} className="text-[var(--color-neutral-200)]" />
                                                    </div>

                                                    {a.vendorStoreName ? (
                                                        <div className="inline-flex items-center border-none px-2 text-caption-strong bg-[rgba(249,168,37,0.1)] text-[var(--color-hint-text-caution)]">
                                                            <p className="inline-block text-caption-strong">فروشنده</p>
                                                        </div>
                                                    ) : null}

                                                    <span className="mr-auto text-body-2 text-neutral-400">
                                                        {toFaDate(a.createdAtUtc)}
                                                    </span>
                                                </div>

                                                <p className="mt-2 text-body-1 text-[#5c5c5c] whitespace-pre-wrap">
                                                    {a.answer}
                                                </p>

                                                {/* votes in dialog */}
                                                <div className="mt-3 flex items-center justify-end text-neutral-500">
                                                    <div className="flex items-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => onVoteAnswer(a.id, myVote, 1)}
                                                            disabled={pending}
                                                            className="relative flex items-center user-select-none text-button-2 rounded-medium px-2 text-neutral-650 bg-transparent outline-none disabled:opacity-60"
                                                            aria-label="مفید بود"
                                                        >
                                                            <div className="flex items-center justify-center relative grow">
                                                                <p className="lg:text-caption text-caption-compact">
                                                                    {toFaNumber(likeCount)}
                                                                </p>
                                                                <div className="flex mr-1">
                                                                    <ThumbsUp
                                                                        size={18}
                                                                        className={[
                                                                            "text-[var(--color-icon-high-emphasis)]",
                                                                            myVote === 1
                                                                                ? "fill-[var(--color-icon-high-emphasis)]"
                                                                                : "fill-transparent",
                                                                        ].join(" ")}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => onVoteAnswer(a.id, myVote, -1)}
                                                            disabled={pending}
                                                            className="relative flex items-center user-select-none text-button-2 rounded-medium px-2 text-neutral-650 bg-transparent outline-none disabled:opacity-60"
                                                            aria-label="مفید نبود"
                                                        >
                                                            <div className="flex items-center justify-center relative grow">
                                                                <p className="lg:text-caption text-caption-compact">
                                                                    {toFaNumber(dislikeCount)}
                                                                </p>
                                                                <div className="flex mr-1">
                                                                    <ThumbsDown
                                                                        size={18}
                                                                        className={[
                                                                            "text-[var(--color-icon-high-emphasis)]",
                                                                            myVote === -1
                                                                                ? "fill-[var(--color-icon-high-emphasis)]"
                                                                                : "fill-transparent",
                                                                        ].join(" ")}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </section>
    );
}
