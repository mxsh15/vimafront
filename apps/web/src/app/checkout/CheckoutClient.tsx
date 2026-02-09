"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getMyCart, clearCart } from "@/modules/cart/api";
import type { CartDto } from "@/modules/cart/types";
import { createOrder } from "@/modules/order/public-api";
import type { OrderCreateDto } from "@/modules/order/types";
import { listShippingOptions } from "@/modules/checkout/api";
import type { ShippingOptionDto } from "@/modules/checkout/types";
import {
  createShippingAddress,
  listMyShippingAddresses,
} from "@/modules/shipping-addresses/api";
import type {
  ShippingAddressCreateDto,
  ShippingAddressDto,
} from "@/modules/shipping-addresses/types";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";
import { IRAN_PROVINCES } from "@/lib/geo/iran-locations";

type PaymentInitiateResult = {
  transactionId: string;
  paymentUrl: string;
  paymentId: string;
  orderId: string;
};

type PaymentMethod = "Online" | "CashOnDelivery" | "BankTransfer" | "Wallet";


const SelectLocationMap = dynamic(
  () => import("@/components/maps/SelectLocationMap").then((m) => m.SelectLocationMap),
  { ssr: false }
);
function AddressCreateInline({
  onCreated,
}: {
  onCreated: (address: ShippingAddressDto) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ShippingAddressCreateDto>({
    title: "خانه",
    province: "",
    city: "",
    addressLine: "",
    postalCode: null,
    isDefault: true,
  });

  const [picked, setPicked] = useState<{ lat: number; lng: number } | null>(null);
  const cities = useMemo(() => {
    const p = IRAN_PROVINCES.find((x) => x.name === form.province);
    return p?.cities ?? [];
  }, [form.province]);

  async function submit() {
    if (!form.province.trim() || !form.city.trim())
      return alert("استان و شهر را انتخاب کنید");

    if (!form.postalCode?.trim())
      return alert("کدپستی را وارد کنید");

    if (!form.addressLine.trim())
      return alert("نشانی را وارد کنید");


    setSaving(true);
    try {
      const created = await createShippingAddress({
        ...form,
        title: form.title.trim(),
        province: form.province.trim(),
        city: form.city.trim(),
        addressLine: form.addressLine.trim(),
        postalCode: form.postalCode?.trim() ? form.postalCode.trim() : null,
        latitude: picked ? picked.lat : null,
        longitude: picked ? picked.lng : null,
      });
      onCreated(created);
      setOpen(false);
    } catch (e) {
      console.error(e);
      alert("خطا در ثبت آدرس");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-slate-700 underline"
      >
        + افزودن آدرس جدید
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-slate-200 p-3 space-y-2">
      <div className="text-sm font-medium">ثبت آدرس جدید</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* نقشه - سمت چپ */}
        <div className="lg:order-1">
          <SelectLocationMap value={picked} onChange={(p) => setPicked(p)} />
        </div>

        {/* فرم - سمت راست */}
        <div className="space-y-2 lg:order-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              value={form.province}
              onChange={(e) =>
                setForm((p) => ({ ...p, province: e.target.value, city: "" }))
              }
              className="w-full rounded-xl border border-slate-200 bg-white p-2 text-sm"
            >
              <option value="">استان را انتخاب کنید</option>
              {IRAN_PROVINCES.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={form.city}
              onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
              disabled={!form.province}
              className="w-full rounded-xl border border-slate-200 bg-white p-2 text-sm disabled:bg-slate-50"
            >
              <option value="">
                {form.province ? "شهر را انتخاب کنید" : "ابتدا استان را انتخاب کنید"}
              </option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <input
              value={form.postalCode ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, postalCode: e.target.value }))
              }
              placeholder="کدپستی"
              className="w-full rounded-xl border border-slate-200 bg-white p-2 text-sm"
            />
          </div>

          <textarea
            value={form.addressLine}
            onChange={(e) =>
              setForm((p) => ({ ...p, addressLine: e.target.value }))
            }
            placeholder="نشانی کامل (خیابان، پلاک، واحد...)"
            rows={4}
            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-sm"
          />

          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isDefault: e.target.checked }))
                }
              />
              پیش‌فرض
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpen(false)}
                type="button"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
              >
                انصراف
              </button>

              <button
                onClick={submit}
                disabled={saving}
                className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-60"
              >
                {saving ? "در حال ثبت..." : "ثبت آدرس"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [cart, setCart] = useState<CartDto | null>(null);
  const [addresses, setAddresses] = useState<ShippingAddressDto[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [shippingOptions, setShippingOptions] = useState<ShippingOptionDto[]>(
    []
  );
  const [selectedShippingRateId, setSelectedShippingRateId] = useState<string>(
    ""
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Online");
  const [notes, setNotes] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const cartTotal = useMemo(() => cart?.totalPrice ?? 0, [cart]);
  const selectedShipping = useMemo(
    () =>
      shippingOptions.find((x) => x.shippingRateId === selectedShippingRateId) ??
      null,
    [shippingOptions, selectedShippingRateId]
  );

  const payable = useMemo(() => {
    const ship = selectedShipping?.price ?? 0;
    return cartTotal + ship;
  }, [cartTotal, selectedShipping]);

  // ✅ گارد ورود
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      const returnUrl = searchParams?.get("returnUrl") || "/checkout";
      router.replace(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [authLoading, isAuthenticated, router, searchParams]);

  useEffect(() => {
    (async () => {
      if (authLoading || !isAuthenticated) return;

      setLoading(true);
      try {
        const [c, addr] = await Promise.all([
          getMyCart(),
          listMyShippingAddresses(),
        ]);

        setCart(c);
        setAddresses(addr);

        const def = (addr as any).find?.((a: any) => a.isDefault) ?? addr[0];
        if (def) setSelectedAddressId(def.id);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, isAuthenticated]);

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
    if (!selectedAddressId) return alert("لطفاً آدرس ارسال را انتخاب کنید");

    setSubmitting(true);
    try {
      // 1) Create Order
      const orderData: OrderCreateDto = {
        shippingAddressId: selectedAddressId,
        couponId: null,
        notes: [
          notes?.trim() ? `Notes: ${notes.trim()}` : null,
          selectedShipping
            ? `Shipping: ${selectedShipping.shippingMethodTitle} (${selectedShipping.price})`
            : null,
        ]
          .filter(Boolean)
          .join(" | "),
        items: cart.items.map((item) => ({
          productId: item.productId,
          vendorOfferId: item.vendorOfferId!,
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        })),
      };

      const order = await createOrder(orderData);

      // 2) پرداخت
      if (paymentMethod === "Online") {
        const res = await apiFetch<PaymentInitiateResult>("payments/initiate", {
          method: "POST",
          body: JSON.stringify({ orderId: order.id, method: 0 }), // Online=0
        });

        // دمو: بعد از شروع پرداخت خالی می‌کنیم
        await clearCart().catch(() => { });
        router.push(res.paymentUrl); // /payment/{transactionId}
        return;
      }

      // پرداخت آفلاین
      await clearCart().catch(() => { });
      router.push(`/orders/${order.id}?paid=0`);
    } catch (err) {
      console.error(err);
      alert("خطا در ثبت سفارش/پرداخت");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) return <div className="p-8">در حال بررسی ورود...</div>;
  if (!isAuthenticated) return <div className="p-8">در حال انتقال...</div>;
  if (loading) return <div className="p-8">در حال بارگذاری...</div>;
  if (!cart || cart.items.length === 0)
    return <div className="p-8">سبد خرید شما خالی است</div>;

  return (
    <div className="container mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">تسویه حساب</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* 1) Address */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">۱) آدرس ارسال</div>
              <AddressCreateInline
                onCreated={(addr) => {
                  setAddresses((p) => [addr, ...p]);
                  setSelectedAddressId(addr.id);
                }}
              />
            </div>

            {addresses.length === 0 ? (
              <div className="mt-3 text-sm text-slate-600">
                هنوز آدرسی ثبت نشده. لطفاً یک آدرس اضافه کنید.
              </div>
            ) : (
              <select
                value={selectedAddressId}
                onChange={(e) => setSelectedAddressId(e.target.value)}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white p-2 text-sm"
              >
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} — {a.province}، {a.city}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 2) Shipping */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="font-semibold mb-3">۲) روش ارسال</div>

            {shippingOptions.length === 0 ? (
              <div className="text-sm text-slate-500">
                برای این آدرس گزینه‌ی ارسالی تعریف نشده است.
              </div>
            ) : (
              <div className="space-y-2">
                {shippingOptions.map((o) => {
                  const eta =
                    o.etaDaysMin || o.etaDaysMax
                      ? `(${o.etaDaysMin ?? ""}${o.etaDaysMax ? ` تا ${o.etaDaysMax}` : ""
                      } روز)`
                      : "";
                  return (
                    <label
                      key={o.shippingRateId}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="ship"
                          checked={selectedShippingRateId === o.shippingRateId}
                          onChange={() =>
                            setSelectedShippingRateId(o.shippingRateId)
                          }
                        />
                        <div className="text-sm">
                          <div className="font-medium">
                            {o.shippingMethodTitle}{" "}
                            <span className="text-slate-500">{eta}</span>
                          </div>
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

          {/* 3) Payment */}
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
                  className={`rounded-xl border px-4 py-3 text-sm text-right ${paymentMethod === x.key
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 bg-white"
                    }`}
                >
                  {x.label}
                </button>
              ))}
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="توضیحات سفارش (اختیاری)"
              className="mt-3 w-full rounded-xl border border-slate-200 bg-white p-2 text-sm min-h-24"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sticky top-4">
            <div className="font-semibold mb-3">خلاصه سفارش</div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">جمع سبد:</span>
                <span className="font-semibold">
                  {Number(cartTotal).toLocaleString("fa-IR")} تومان
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">هزینه ارسال:</span>
                <span className="font-semibold">
                  {Number(selectedShipping?.price ?? 0).toLocaleString("fa-IR")}{" "}
                  تومان
                </span>
              </div>
              <div className="h-px bg-slate-200 my-2" />
              <div className="flex justify-between">
                <span className="text-slate-900">قابل پرداخت:</span>
                <span className="text-lg font-bold">
                  {Number(payable).toLocaleString("fa-IR")} تومان
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-white text-sm disabled:opacity-50"
            >
              {submitting ? "در حال ثبت سفارش..." : "ثبت سفارش و پرداخت"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
