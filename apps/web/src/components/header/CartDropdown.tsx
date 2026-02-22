"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import { removeFromCart, updateCartItem } from "@/modules/cart/api";
import type { CartDto, CartItemDto } from "@/modules/cart/types";
import { MY_CART_QUERY_KEY, useMyCartQuery } from "@/modules/cart/hooks";

function toman(n: number) {
    return (n || 0).toLocaleString("fa-IR");
}

export function CartDropdown({ initialCart }: { initialCart?: CartDto | null }) {
    const qc = useQueryClient();
    const { data: cart, isLoading, error } = useMyCartQuery(initialCart ?? undefined);

    const count = useMemo(() => {
        if (!cart) return 0;
        if (typeof cart.totalItems === "number") return cart.totalItems;
        return cart.items?.reduce((acc, x) => acc + (x.quantity || 0), 0) ?? 0;
    }, [cart]);

    const [open, setOpen] = useState(false);
    const closeTimer = useRef<any>(null);

    function openNow() {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setOpen(true);
        qc.invalidateQueries({ queryKey: MY_CART_QUERY_KEY });
    }

    function closeSoon() {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => setOpen(false), 120);
    }

    async function setQty(item: CartItemDto, nextQty: number) {
        if (nextQty < 1) return;
        await updateCartItem(item.id, { quantity: nextQty });
        await qc.invalidateQueries({ queryKey: MY_CART_QUERY_KEY });
    }

    async function removeItem(item: CartItemDto) {
        await removeFromCart(item.id);
        await qc.invalidateQueries({ queryKey: MY_CART_QUERY_KEY });
    }

    const status = (error as any)?.status || (error as any)?.cause?.status;
    const isUnauthorized = status === 401;

    return (
        <div
            className="relative"
            onMouseEnter={openNow}
            onMouseLeave={closeSoon}
            onFocus={openNow}
            onBlur={closeSoon}
        >
            <Link
                href="/cart"
                className="dropdown-toggle relative inline-flex items-center 
                            justify-center w-10 h-10 rounded-xl bg-white border 
                            border-gray-200 hover:bg-gray-50 transition"
                aria-label="سبد خرید"
                title="سبد خرید"
            >
                <ShoppingCart className="w-5 h-5 text-gray-800" />

                {count > 0 ? (
                    <span className="absolute -top-2 -left-2 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-rose-600 text-white text-[11px] px-1 font-bold">
                        {count.toLocaleString("fa-IR")}
                    </span>
                ) : null}
            </Link>

            <Dropdown
                isOpen={open}
                onClose={() => setOpen(false)}
                className="mt-2 w-[360px] rounded-2xl border border-gray-200 bg-white shadow-xl p-3"
            >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                    <div className="text-sm font-bold text-gray-900">سبد خرید</div>
                    <Link href="/cart" className="text-xs text-gray-600 hover:text-rose-600">
                        مشاهده سبد
                    </Link>
                </div>

                {isLoading ? (
                    <div className="py-6 text-sm text-gray-600 text-center">در حال بارگذاری…</div>
                ) : isUnauthorized ? (
                    <div className="py-6 text-sm text-gray-700 text-center">
                        برای دیدن سبد خرید باید وارد شوید.
                        <div className="mt-3">
                            <Link
                                href={`/login?returnUrl=${encodeURIComponent("/cart")}`}
                                className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition"
                            >
                                ورود
                            </Link>
                        </div>
                    </div>
                ) : !cart || cart.items.length === 0 ? (
                    <div className="py-6 text-sm text-gray-600 text-center">سبد خرید شما خالی است.</div>
                ) : (
                    <>
                        <div className="max-h-[320px] overflow-auto custom-scrollbar space-y-2">
                            {cart.items.map((item) => {
                                return (
                                    <div key={item.id} className="flex gap-3 p-2 rounded-xl hover:bg-gray-50">
                                        <div key={item.id} className="flex gap-3 p-2 rounded-xl hover:bg-gray-50">
                                            <div className="w-14 h-14 rounded-xl border border-gray-200 bg-white overflow-hidden shrink-0">
                                                {item.productImageUrl ? (
                                                    <img
                                                        src={resolveMediaUrl(item.productImageUrl)}
                                                        alt={item.productTitle}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : null}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold text-gray-900 truncate">
                                                    {item.productTitle}
                                                </div>
                                                {item.variantName ? (
                                                    <div className="text-xs text-gray-500 truncate">{item.variantName}</div>
                                                ) : null}

                                                <div className="mt-1 flex items-center justify-between gap-2">
                                                    <div className="text-xs text-gray-700 font-bold">
                                                        {toman(item.unitPrice)} تومان
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => setQty(item, item.quantity - 1)}
                                                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-100"
                                                            aria-label="کم کردن"
                                                            title="کم کردن"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>

                                                        <div className="w-8 text-center text-sm font-bold">
                                                            {item.quantity.toLocaleString("fa-IR")}
                                                        </div>

                                                        <button
                                                            onClick={() => setQty(item, item.quantity + 1)}
                                                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-100"
                                                            aria-label="زیاد کردن"
                                                            title="زیاد کردن"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            onClick={() => removeItem(item)}
                                                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 hover:bg-rose-50 hover:border-rose-200"
                                                            aria-label="حذف"
                                                            title="حذف"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-rose-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between text-sm mb-3">
                                <span className="text-gray-600">جمع کل:</span>
                                <span className="font-extrabold text-gray-900">
                                    {toman(cart.totalPrice)} تومان
                                </span>
                            </div>

                            <Link
                                href="/cart"
                                className="block w-full text-center h-11 leading-[44px] rounded-xl bg-rose-600 text-white font-extrabold hover:bg-rose-700 transition"
                            >
                                ثبت سفارش
                            </Link>
                        </div>
                    </>
                )}
            </Dropdown>
        </div>
    );
}
