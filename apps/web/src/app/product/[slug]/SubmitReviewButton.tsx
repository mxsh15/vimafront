"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { submitReview } from "@/modules/review/api";
import { resolveMediaUrl } from "@/modules/media/resolve-url";

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

function useLockBodyScroll(locked: boolean) {
    useEffect(() => {
        if (!locked) return;

        const prevOverflow = document.body.style.overflow;
        const prevPaddingRight = document.body.style.paddingRight;

        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = "hidden";
        if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

        return () => {
            document.body.style.overflow = prevOverflow;
            document.body.style.paddingRight = prevPaddingRight;
        };
    }, [locked]);
}

export default function SubmitReviewButton({
    productId,
    productTitle,
    productImageUrl,
}: {
    productId: string;
    productTitle: string;
    productImageUrl?: string | null;
}) {
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();
    const displayName = (user?.fullName || user?.email || "").trim() || "کاربر";

    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [step, setStep] = useState<"form" | "success">("form");

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => setMounted(true), []);
    useLockBodyScroll(open);

    const canSubmit = useMemo(() => comment.trim().length >= 5 && rating >= 1 && rating <= 5, [comment, rating]);

    function handleOpen() {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }
        setError(null);
        setStep("form");
        setOpen(true);
    }

    function close() {
        setOpen(false);
        setTimeout(() => {
            setStep("form");
            setRating(5);
            setComment("");
            setError(null);
        }, 150);
    }

    async function handleSubmit() {
        if (!canSubmit || submitting) return;
        setSubmitting(true);
        setError(null);
        try {
            await submitReview({ productId, rating, comment: comment.trim() });
            setStep("success");
        } catch (e: any) {
            setError(e?.message || "ارسال دیدگاه با خطا مواجه شد.");
        } finally {
            setSubmitting(false);
        }
    }

    // ESC
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (ev: KeyboardEvent) => {
            if (ev.key === "Escape") close();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open]);

    const modal = open ? (
        <div className="fixed inset-0 z-[9999]" role="dialog" aria-modal="true">
            {/* backdrop */}
            <button
                type="button"
                className="absolute inset-0 bg-black/40"
                onClick={close}
                aria-label="بستن"
            />

            {/* center */}
            <div className="absolute inset-0 flex items-center justify-center p-2 md:p-6">
                {/* panel */}
                <div
                    className="w-full max-w-[860px] h-[92vh] md:h-[80vh] md:w-[30vw] bg-white rounded-[12px] overflow-hidden shadow-lg flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {step === "form" ? (
                        <>
                            <div className="sticky top-0 z-[3] bg-[var(--color-neutral-000)]">
                                <div className="border-b border-b-[var(--color-neutral-100)] !border-b-4">
                                    <div className="flex items-center px-5 py-3 text-[var(--color-neutral-650)]">
                                        <div className="flex items-center">
                                            <button
                                                type="button"
                                                onClick={close}
                                                className="flex cursor-pointer"
                                                aria-label="بازگشت"
                                            >
                                                <ArrowRight
                                                    size={24}
                                                    className="font-normal text-[var(--color-icon-high-emphasis)]"
                                                />
                                            </button>
                                            <span className="text-h5 mr-1 [font-family:var(--font-iransans)]">ثبت دیدگاه</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* body scroll */}
                            <div className="flex-1 overflow-y-auto">
                                <div className="p-4 pb-[55px]">
                                    <div className="flex flex-col items-start">
                                        <div className="flex items-start w-full">
                                            <span className="flex flex-col items-start mb-4">
                                                <div className="shrink-0 w-[56px] h-[56px] leading-none">
                                                    {productImageUrl ? (
                                                        <img
                                                            src={resolveMediaUrl(productImageUrl)}
                                                            alt={productTitle}
                                                            width={56}
                                                            height={56}
                                                            className="w-full h-full inline-block object-contain"
                                                        />
                                                    ) : (
                                                        <span className="text-neutral-400 text-xs">تصویر ندارد</span>
                                                    )}
                                                </div>
                                            </span>

                                            <div className="mr-3 min-w-0">
                                                <p className="text-body1-strong text-[var(--color-neutral-800)] ellipsis-1 grow-0 truncate">
                                                    {productTitle}
                                                </p>
                                            </div>
                                        </div>

                                        <form
                                            className="w-full"
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                handleSubmit();
                                            }}
                                        >
                                            <div className="border-b border-b-[var(--color-neutral-100)]" />

                                            <div className="my-5">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <span className="[font-family:var(--font-iransans)] text-subtitle-strong after:content-['*'] after:text-red-500">
                                                        متن دیدگاه:
                                                    </span>
                                                </div>

                                                <label className="w-full inline-block">
                                                    <div className="overflow-hidden border border-[var(--color-neutral-100)] rounded-[8px] lg:border-[var(--color-neutral-300)]">
                                                        <div className="grow text-body-3">
                                                            <textarea
                                                                className="w-full h-[116px]
                                px-1 py-5
                                rounded-[var(--global-radius)]
                                bg-transparent resize-none
                                text-[0.8rem] lg:text-[0.9rem]
                                font-normal leading-[2.15]
                                text-[var(--color-neutral-700)]
                                border-0 grow
                                caret-[var(--color-secondary-500)]
                                outline-none
                                [font-family:var(--font-iransans)]"
                                                                placeholder="نظر خود را در مورد این کالا با کاربران دیگر به اشتراک بگذارید.."
                                                                autoComplete="off"
                                                                value={comment}
                                                                onChange={(e) => setComment(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </label>

                                                <div
                                                    className="border-complete !border-t-0
                          !border-l-neutral-300
                          !border-b-neutral-300
                          !border-r-neutral-300
                          p-2 items-center rounded-b-md
                          flex justify-between mb-2"
                                                >
                                                    <span className="text-body2-strong text-[var(--color-neutral-650)] [font-family:var(--font-iransans)] truncate">
                                                        {displayName}
                                                    </span>
                                                    <span className="text-xs text-neutral-400 [font-family:var(--font-iransans)]">حداقل 5 کاراکتر</span>
                                                </div>

                                                {error ? (
                                                    <div className="mt-2 text-sm text-[var(--color-button-primary)]">
                                                        {error}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div className="sticky bottom-0 z-[3] bg-[var(--color-neutral-000)] px-5 py-4 shadow-1-top">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={!canSubmit || submitting}
                                    className={[
                                        "relative flex items-center user-select-none rounded-[var(--radius-global)] w-full mb-2",
                                        "px-[16px] py-[12px] border",
                                        !canSubmit || submitting
                                            ? "bg-[var(--color-neutral-200)] border-[var(--color-neutral-200)] text-neutral-500 cursor-not-allowed"
                                            : "border-[var(--color-button-primary)] bg-[var(--color-button-primary)] text-[var(--color-button-text-primary)]",
                                    ].join(" ")}
                                >
                                    <div className="flex items-center justify-center relative grow [font-family:var(--font-iransans)]">
                                        {submitting ? "در حال ارسال…" : "ثبت دیدگاه"}
                                    </div>
                                </button>

                                <div className="text-xs text-neutral-500 [font-family:var(--font-iransans)] text-center mt-5">
                                    ثبت دیدگاه به معنی موافقت با قوانین انتشار سایت است.
                                </div>
                            </div>
                        </>
                    ) : (
                        // success
                        <div className="h-full flex flex-col">
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                                <div className="flex items-center justify-center [font-family:var(--font-iransans)]">
                                    <Image
                                        src="/images/congralations.jpg"
                                        alt="ثبت دیدگاه"
                                        width={350}
                                        height={265}
                                        className="object-contain"
                                    />
                                </div>

                                <div className="text-h4 mt-2 [font-family:var(--font-iransans)]">{displayName} عزیز! از مشارکتتان ممنونیم!</div>
                                <div className="text-body-2 text-neutral-600 mt-2 max-w-[520px] [font-family:var(--font-iransans)]">
                                    ممکن است کمی زمان ببرد تا دیدگاه شما پس از بررسی نمایش داده شود.
                                </div>
                            </div>

                            <div className="p-5">
                                <button
                                    type="button"
                                    onClick={close}
                                    className="w-full rounded-[var(--radius-global)] py-4 text-button-2 
                                    bg-[var(--color-button-primary)] text-white [font-family:var(--font-iransans)]"
                                >
                                    بازگشت
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    ) : null;


    return (
        <>
            <button
                type="button"
                onClick={handleOpen}
                className="relative flex items-center user-select-none text-button-2
        rounded-md w-full mt-2 [font-family:var(--font-iransans)]
        text-[var(--color-button-primary)] px-[16px] py-[8px]
        border border-[var(--color-button-primary)]
        outline-none overflow-hidden cursor-pointer
        transition-[top] duration-300 ease-in-out h-[40px]"
            >
                <span className="flex items-center justify-center relative grow">ثبت دیدگاه</span>
            </button>

            {mounted && modal ? createPortal(modal, document.body) : null}
        </>
    );
}
