"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/modules/cart/api";
import { getToken } from "@/modules/auth/client-api";

export function AddToCartButton({
    productId,
    vendorOfferId,
    disabled,
}: {
    productId: string;
    vendorOfferId: string;
    disabled?: boolean;
}) {
    const router = useRouter();
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(false);

    async function handleAdd() {
        // Cart API در بک‌اند Authorize است؛ پس بدون لاگین می‌بریم به ورود
        const token = getToken();
        if (!token) {
            const returnUrl = `/product/${productId}`;
            router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
            return;
        }

        setLoading(true);
        try {
            await addToCart({
                productId,
                vendorOfferId,
                quantity: qty,
            });
            router.refresh();
            alert("به سبد خرید اضافه شد ✅");
        } catch (e) {
            console.error(e);
            alert("خطا در افزودن به سبد خرید");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center gap-2">
            <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))}
                className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />

            <button
                disabled={disabled || loading}
                onClick={handleAdd}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
                {loading ? "در حال افزودن..." : "افزودن به سبد خرید"}
            </button>
        </div>
    );
}
