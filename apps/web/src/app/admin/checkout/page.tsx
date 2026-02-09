"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyCart, clearCart } from "@/modules/cart/api";
import type { CartDto } from "@/modules/cart/types";
import { createOrder } from "@/modules/order/api";
import type { OrderCreateDto } from "@/modules/order/types";
import { apiFetch } from "@/lib/api";
import { listShippingOptions } from "@/modules/checkout/api";
import type { ShippingOptionDto } from "@/modules/checkout/types";

type ShippingAddressDto = {
    id: string;
    title: string;
    firstName: string;
    lastName: string;
    province: string;
    city: string;
    addressLine: string;
    postalCode?: string | null;
    phoneNumber?: string | null;
    mobileNumber?: string | null;
    isDefault?: boolean;
};

type PaymentInitiateResult = {
    transactionId: string;
    paymentUrl: string;
    paymentId: string;
    orderId: string;
};

type PaymentMethod = "Online" | "CashOnDelivery" | "BankTransfer" | "Wallet";

export default function CheckoutPage() {
    const router = useRouter();

    const [cart, setCart] = useState<CartDto | null>(null);
    const [addresses, setAddresses] = useState<ShippingAddressDto[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");
    const [shippingOptions, setShippingOptions] = useState<ShippingOptionDto[]>([]);
    const [selectedShippingRateId, setSelectedShippingRateId] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Online");
    const [notes, setNotes] = useState<string>("");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const cartTotal = useMemo(() => cart?.totalPrice ?? 0, [cart]);
    const selectedShipping = useMemo(
        () => shippingOptions.find(x => x.shippingRateId === selectedShippingRateId) ?? null,
        [shippingOptions, selectedShippingRateId]
    );

    const payable = useMemo(() => {
        const ship = selectedShipping?.price ?? 0;
        return cartTotal + ship;
    }, [cartTotal, selectedShipping]);

    useEffect(() => {
        (async () => {
            try {
                const [c, addr] = await Promise.all([
                    getMyCart(),
                    apiFetch<ShippingAddressDto[]>("shipping-addresses"),
                ]);

                setCart(c);
                setAddresses(addr);

                const def = addr.find(a => (a as any).isDefault) ?? addr[0];
                if (def) setSelectedAddressId(def.id);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (!selectedAddressId) return;

        (async () => {
            try {
                const opts = await listShippingOptions(selectedAddressId);
                setShippingOptions(opts);
                setSelectedShippingRateId(opts[0]?.shippingRateId ?? "");
            } catch (e) {
                console.error(e);
                setShippingOptions([]);
                setSelectedShippingRateId("");
            }
        })();
    }, [selectedAddressId]);

    async function handleSubmit() {
        if (!cart || cart.items.length === 0) return;
        if (!selectedAddressId) return;

        setSubmitting(true);
        try {
            // 1) Create Order (مثل قبل)
            const orderData: OrderCreateDto = {
                shippingAddressId: selectedAddressId,
                couponId: null,
                notes: [
                    notes?.trim() ? `Notes: ${notes.trim()}` : null,
                    selectedShipping ? `Shipping: ${selectedShipping.shippingMethodTitle} (${selectedShipping.price})` : null,
                ].filter(Boolean).join(" | "),
                items: cart.items.map((item) => ({
                    productId: item.productId,
                    vendorOfferId: item.vendorOfferId!, // در cart آیتم‌ها این باید پر باشد
                    productVariantId: item.productVariantId,
                    quantity: item.quantity,
                })),
            };

            const order = await createOrder(orderData);

            // 2) اگر پرداخت آنلاین: initiate و برو به /payment/{txn}
            if (paymentMethod === "Online") {
                const res = await apiFetch<PaymentInitiateResult>("payments/initiate", {
                    method: "POST",
                    body: JSON.stringify({ orderId: order.id, method: 0 }), // Online=0
                });

                // cart را خالی کنیم (اختیاری؛ من بعد از شروع پرداخت انجام می‌دم)
                await clearCart().catch(() => { });
                router.push(res.paymentUrl); // /payment/{transactionId}
                return;
            }

            // 3) پرداخت غیرآنلاین: فعلاً مستقیم برو صفحه سفارش
            await clearCart().catch(() => { });
            router.push(`/orders/${order.id}`);
        } catch (err) {
            console.error(err);
            alert("خطا در ثبت سفارش/پرداخت");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <div className="p-8">در حال بارگذاری...</div>;
    if (!cart || cart.items.length === 0) return <div className="p-8">سبد خرید شما خالی است</div>;

    return (
        <div className="container mx-auto p-6 space-y-4">
            <h1 className="text-2xl font-bold">تسویه حساب</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Step 1: Address */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="font-semibold mb-3">۱) آدرس ارسال</div>

                        <select
                            value={selectedAddressId}
                            onChange={(e) => setSelectedAddressId(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-sm"
                        >
                            {addresses.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.title} — {a.province}، {a.city}
                                </option>
                            ))}
                        </select>

                        <div className="mt-3 text-xs text-slate-600">
                            برای افزودن/ویرایش آدرس می‌تونی بعداً صفحه مدیریت آدرس‌ها رو هم اضافه کنیم؛
                            الان API بک‌اند آماده است.
                        </div>
                    </div>

                    {/* Step 2: Shipping */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="font-semibold mb-3">۲) روش ارسال</div>

                        {shippingOptions.length === 0 ? (
                            <div className="text-sm text-slate-500">برای این آدرس گزینه‌ی ارسالی تعریف نشده است.</div>
                        ) : (
                            <div className="space-y-2">
                                {shippingOptions.map((o) => {
                                    const eta =
                                        o.etaDaysMin || o.etaDaysMax
                                            ? `(${o.etaDaysMin ?? ""}${o.etaDaysMax ? ` تا ${o.etaDaysMax}` : ""} روز)`
                                            : "";
                                    return (
                                        <label key={o.shippingRateId} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="ship"
                                                    checked={selectedShippingRateId === o.shippingRateId}
                                                    onChange={() => setSelectedShippingRateId(o.shippingRateId)}
                                                />
                                                <div className="text-sm">
                                                    <div className="font-medium">{o.shippingMethodTitle} <span className="text-slate-500">{eta}</span></div>
                                                </div>
                                            </div>
                                            <div className="text-sm font-semibold">
                                                {Number(o.price).toLocaleString("fa-IR")} تومان
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Step 3: Payment */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="font-semibold mb-3">۳) روش پرداخت</div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {[
                                { key: "Online", label: "پرداخت آنلاین" },
                                { key: "CashOnDelivery", label: "پرداخت در محل" },
                                { key: "BankTransfer", label: "کارت به کارت/واریز" },
                                { key: "Wallet", label: "کیف پول" },
                            ].map((x) => (
                                <button
                                    key={x.key}
                                    type="button"
                                    onClick={() => setPaymentMethod(x.key as PaymentMethod)}
                                    className={`rounded-xl border p-3 text-sm text-right ${paymentMethod === x.key ? "border-slate-900" : "border-slate-200"
                                        }`}
                                >
                                    {x.label}
                                </button>
                            ))}
                        </div>

                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="mt-3 w-full rounded-xl border border-slate-200 p-2 text-sm"
                            rows={3}
                            placeholder="یادداشت سفارش (اختیاری)"
                        />
                    </div>
                </div>

                {/* Summary */}
                <div className="lg:col-span-1">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 sticky top-4">
                        <div className="font-semibold mb-3">خلاصه سفارش</div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>جمع سبد:</span>
                                <span>{Number(cartTotal).toLocaleString("fa-IR")} تومان</span>
                            </div>
                            <div className="flex justify-between">
                                <span>ارسال:</span>
                                <span>{Number(selectedShipping?.price ?? 0).toLocaleString("fa-IR")} تومان</span>
                            </div>
                            <div className="flex justify-between font-bold pt-2 border-t border-slate-200">
                                <span>قابل پرداخت:</span>
                                <span>{Number(payable).toLocaleString("fa-IR")} تومان</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            disabled={submitting || !selectedAddressId || (shippingOptions.length > 0 && !selectedShippingRateId)}
                            onClick={handleSubmit}
                            className="mt-4 w-full rounded-xl bg-slate-900 text-white py-3 text-sm disabled:opacity-50"
                        >
                            {submitting ? "در حال ثبت..." : "ثبت سفارش و ادامه پرداخت"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
