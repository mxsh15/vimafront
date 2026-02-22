"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { addToCart, removeFromCart, updateCartItem } from "@/modules/cart/api";
import { useMyCartQuery, MY_CART_QUERY_KEY } from "../hooks";
import { CartAddedToast } from "./CartAddedToast";
import { Minus, Plus, Trash2 } from "lucide-react";

export function AddToCartButton({
    productId,
    productSlug,
    vendorOfferId,
    disabled,
    minQuantity = 1,
    maxQuantity = 0,
    quantityStep = 1,
}: {
    productId: string;
    productSlug?: string;
    vendorOfferId: string;
    disabled?: boolean;
    minQuantity?: number;
    maxQuantity?: number;
    quantityStep?: number;
}) {

    const router = useRouter();
    const qc = useQueryClient();
    const { data: cart } = useMyCartQuery();
    const [loading, setLoading] = useState(false);
    const [toastOpen, setToastOpen] = useState(false);

    const cartItem = useMemo(() => {
        if (!cart?.items?.length) return null;
        return (
            cart.items.find(
                (x) =>
                    x.productId === productId &&
                    (x.vendorOfferId ? x.vendorOfferId === vendorOfferId : true)
            ) ?? null
        );
    }, [cart, productId, vendorOfferId]);


    async function handleAdd() {
        if (disabled || loading) return;

        setLoading(true);
        try {
            await addToCart({
                productId,
                vendorOfferId,
                quantity: minQuantity,
            });
            setToastOpen(true);
            await qc.invalidateQueries({ queryKey: MY_CART_QUERY_KEY });
        } catch (e: any) {
            const status = e?.status || e?.cause?.status;

            if (status === 401) {
                const returnUrl = productSlug
                    ? `/product/${encodeURIComponent(productSlug)}`
                    : `/product/${productId}`;

                router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
                return;
            }

            console.error(e);
            alert("خطا در افزودن به سبد خرید");
        } finally {
            setLoading(false);
        }
    }

    async function handleRemove() {
        if (!cartItem || loading) return;

        setLoading(true);
        try {
            await removeFromCart(cartItem.id);
            await qc.invalidateQueries({ queryKey: MY_CART_QUERY_KEY });
        } catch (e) {
            console.error(e);
            alert("خطا در حذف از سبد خرید");
        } finally {
            setLoading(false);
        }
    }

    async function handleIncrease() {
        if (!cartItem || loading) return;

        const step = quantityStep > 0 ? quantityStep : 1;
        const next = cartItem.quantity + step;

        if (maxQuantity > 0 && next > maxQuantity) return;

        setLoading(true);
        try {
            await updateCartItem(cartItem.id, { quantity: next });
            await qc.invalidateQueries({ queryKey: MY_CART_QUERY_KEY });
        } catch (e) {
            console.error(e);
            alert("خطا در افزایش تعداد");
        } finally {
            setLoading(false);
        }
    }


    async function handleDecreaseOrRemove() {
        if (!cartItem || loading) return;

        const step = quantityStep > 0 ? quantityStep : 1;
        if (cartItem.quantity <= minQuantity) {
            await handleRemove();
            return;
        }

        const next = cartItem.quantity - step;
        if (next < minQuantity) {
            await handleRemove();
            return;
        }

        setLoading(true);
        try {
            await updateCartItem(cartItem.id, { quantity: next });
            await qc.invalidateQueries({ queryKey: MY_CART_QUERY_KEY });
        } catch (e) {
            console.error(e);
            alert("خطا در کاهش تعداد");
        } finally {
            setLoading(false);
        }
    }

    if (cartItem) {
        const step = quantityStep > 0 ? quantityStep : 1;
        const isMax = maxQuantity > 0 && cartItem.quantity >= maxQuantity;
        const shouldShowTrash = cartItem.quantity <= minQuantity;
        return (
            <>
                <div className="flex items-center justify-between grow px-2
                                rounded-[8px] w-[102px] max-w-[102px] min-h-[44px] max-h-[44px]
                                shadow-[0px_1px_5px_rgba(0,0,0,0.2)]"
                >
                    <div className="flex p-0 lg:p-0">
                        <button
                            type="button"
                            disabled={loading || isMax}
                            onClick={handleIncrease}
                            className="flex cursor-pointer p-0 lg:p-0 disabled:opacity-50 disabled:pointer-events-none"
                            aria-label="افزایش تعداد"
                            title="افزایش"
                        >
                            <span className="inline-flex items-center justify-center">
                                <Plus className="text-[var(--color-button-primary)]" size={18} />
                            </span>
                        </button>
                    </div>
                    <div className="flex flex-col items-center justify-between text-primary-500">
                        <span className="relative flex items-center justify-center text-h5">
                            {cartItem.quantity.toLocaleString("fa-IR")}
                        </span>
                        {isMax ? <span className="text-caption text-neutral-300">حداکثر</span> : ""}
                    </div>
                    <div className="flex cursor-pointer">
                        <button
                            type="button"
                            disabled={loading}
                            onClick={handleDecreaseOrRemove}
                            className="flex cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                            aria-label={shouldShowTrash ? "حذف از سبد خرید" : "کاهش تعداد"}
                            title={shouldShowTrash ? "حذف" : "کاهش"}
                        >
                            {shouldShowTrash ? (
                                <Trash2
                                    size={18}
                                    className="text-[var(--color-button-primary)]"
                                    strokeWidth={2}
                                />
                            ) : (
                                <Minus className="text-[var(--color-button-primary)]" size={18} />
                            )}
                        </button>
                    </div>

                </div>
                <div className="mr-2 lg:mr-4 hidden lg:block shrink-0">
                    <div className="mr-2 lg:mr-4 hidden lg:block shrink-0">
                        <p className="text-neutral-700 text-body-1">در سبد شما</p>
                        <div className="flex items-center text-[0.7rem] font-normal">
                            مشاهده
                            <Link
                                className="text-secondary-500"
                                href="/checkout/cart/"
                            >
                                <p className="mr-1 text-body-2">سبد خرید</p>
                            </Link>
                        </div>
                    </div>
                </div>

                <CartAddedToast open={toastOpen} onClose={() => setToastOpen(false)} />
            </>
        );
    }

    return (
        <>
            <button
                disabled={disabled || loading}
                onClick={handleAdd}
                className="relative flex items-center user-select-none
                        text-button-2 rounded-medium w-full h-12
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all
                        bg-[var(--color-button-primary)]
                        text-[var(--color-button-text-primary)]
                        border border-[var(--color-button-primary)]
                        py-2 px-4 rounded-md cursor-pointer"
            >
                <div className="flex items-center justify-center relative grow">
                    <div className="flex flex-col w-full justify-center gap-1">
                        <div className="text-button-1-compact [font-family:var(--font-iransans)] font-medium text-white">
                            {loading ? "در حال افزودن..." : "افزودن به سبد خرید"}
                        </div>
                    </div>
                </div>
            </button>
            <CartAddedToast open={toastOpen} onClose={() => setToastOpen(false)} />
        </>
    );
}
