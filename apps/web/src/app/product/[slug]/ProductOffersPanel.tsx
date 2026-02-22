import Link from "next/link";
import { AddToCartButton } from "@/modules/cart/ui/AddToCartButton";
import { getPublicProductOffersBySlug } from "@/modules/product/public-api.server";
import { normalizeSlugParam } from "@/modules/product/slug";
import { getPublicStoreSettings } from "@/modules/settings/public-api.server";
import { Store, Info, ChevronLeft, ShieldCheck } from "lucide-react";
import { ShippingMethodRow } from "./ShippingMethodRow";

function toFaMoney(n: number) {
  return Number(n).toLocaleString("fa-IR");
}

function hasValidPrice(n: unknown): n is number {
  return typeof n === "number" && isFinite(n) && n > 0;
}

export default async function ProductOffersPanel({
  productId,
  productSlug,
}: {
  productId: string;
  productSlug: string;
}) {
  const slug = normalizeSlugParam(productSlug);

  const [settings, offersRes] = await Promise.all([
    getPublicStoreSettings(),
    getPublicProductOffersBySlug(slug),
  ]);

  const multiVendorEnabled = settings?.multiVendorEnabled ?? true;
  const { vendorOffers } = offersRes;

  const buyableOffers = (vendorOffers ?? [])
    .filter((o) => !o.isDeleted)
    .filter((o) => {
      const s = typeof o.status === "number" ? o.status : String(o.status);
      return s === 1 || s === "Approved" || s === "1";
    })
    .filter((o) => {
      if (!o.manageStock) return true;
      const minQ = o.minOrderQuantity ?? 1;
      return (o.stockQuantity ?? 0) >= minQ;
    }).sort((a, b) => {
      const ap = Number(a.discountPrice ?? a.price);
      const bp = Number(b.discountPrice ?? b.price);
      return ap - bp;
    });

  const bestOffer = buyableOffers[0] ?? null;
  const otherOffersCount = Math.max(0, buyableOffers.length - 1);

  // قیمت نهایی
  const finalPrice = bestOffer ? (bestOffer.discountPrice ?? bestOffer.price) : null;
  const hasPrice = hasValidPrice(finalPrice);

  // فروشنده
  const sellerName = bestOffer?.vendorName ?? "نامشخص";
  const sellerHref = bestOffer?.vendorId ? `/seller/${bestOffer.vendorId}/` : "#";

  const minQ = Math.max(1, bestOffer?.minOrderQuantity ?? 1);
  const stepQ = Math.max(1, bestOffer?.quantityStep ?? 1);
  const maxQ = Math.max(0, bestOffer?.maxOrderQuantity ?? 0);


  const basePrice = bestOffer?.price ?? null;
  const discountPrice = bestOffer?.discountPrice ?? null;
  const hasBase = hasValidPrice(basePrice);
  const hasDiscount =
    hasValidPrice(basePrice) &&
    hasValidPrice(discountPrice) &&
    discountPrice! < basePrice!;
  const shownFinalPrice = hasDiscount ? discountPrice! : (hasBase ? basePrice! : null);
  const discountPercent = hasDiscount
    ? Math.round(((basePrice! - discountPrice!) / basePrice!) * 100)
    : 0;

  return (
    <div className="h-full area-buy-box">
      <div className="flex flex-col lg:mr-3 lg:mb-3 lg:gap-y-2 sticky top-[180px]">
        <div
          className="lg:rounded-[var(--radius-global)] lg:border bg-neutral-000
          lg:border-t lg:border-[var(--color-neutral-200)]
          lg:[background:linear-gradient(0deg,#efeff080,#efeff080),#fff]
          "
        >
          {/* Header */}
          <div className="break-words pt-4 pb-2 px-5 w-full flex items-center justify-between user-select-none">
            <h3 className="grow text-h5 text-neutral-900">فروشنده</h3>

            {multiVendorEnabled && otherOffersCount > 0 ? (
              <span className="text-body-2 text-secondary-500 cursor-pointer [font-family:var(--font-iransans)]">
                {toFaMoney(otherOffersCount)} فروشنده دیگر
              </span>
            ) : (
              <span className="text-body-2 text-secondary-500 opacity-0 select-none">
                -
              </span>
            )}
          </div>

          {/* Seller row */}
          <div className="pt-3">
            <a
              className="[display:inherit] text-inherit [justify-content:inherit] [align-items:inherit]"
              target="_blank"
              rel="noreferrer"
              href={sellerHref}
            >
              <div className="w-full px-4 flex">
                <div className="py-3 flex grow flex pt-0 pb-4">
                  <div className="ml-4">
                    <div className="relative">
                      <div className="flex" aria-hidden="false">
                        <Store className="w-6 h-6 text-icon-high-emphasis" />
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full">
                    <div>
                      <div className="flex items-center mb-2 lg:mb-1">
                        <span>
                          <p className="text-neutral-700 ml-2 text-subtitle">
                            {sellerName}
                          </p>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          </div>

          {/* Price + cart */}
          <div className="relative w-full lg:px-4 lg:pb-2">
            <div className="border-complete-t-200 lg:pt-4">
              <div className="w-full z-3 bg-neutral-000 shadow-fab-button lg:shadow-none lg:bg-transparent">
                <div>
                  <div className="flex items-center mb-1">
                    <div className="flex a-center">
                      <div>
                        <div>
                          <div className="flex cursor-pointer">
                            <Info className="w-4 h-4 text-neutral-500" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {hasDiscount ? (

                      /* ===== حالت تخفیف دار ===== */
                      <div className="flex justify-start relative flex-col items-end mr-auto text-h3">

                        <div className="flex items-center justify-end w-full gap-1">
                          {/* قیمت اصلی خط خورده */}
                          <span className="line-through text-body-2 ml-1 text-neutral-300 [font-family:var(--font-iransans)]">
                            {toFaMoney(basePrice!)}
                          </span>

                          {/* درصد تخفیف */}
                          <div className="px-1 text-white flex items-center justify-center 
                          bg-hint-object-error shrink-0 mr-1 mb-1 w-[34px] h-[20px] rounded-[16px]">
                            <span className="text-body2-strong [font-family:var(--font-iransans)]">
                              {discountPercent.toLocaleString("fa-IR")}٪
                            </span>
                          </div>
                        </div>

                        {/* قیمت نهایی */}
                        <div className="flex flex-row items-center">
                          <span className="ml-1 text-neutral-800 text-h4-compact [font-family:var(--font-iransans)]
                          font-semibold">
                            {toFaMoney(discountPrice!)}
                          </span>

                          <div className="flex [font-family:var(--font-iransans)] text-[.6rem]" aria-hidden="false">
                            تومان
                          </div>
                        </div>

                      </div>

                    ) : (

                      /* ===== حالت بدون تخفیف ===== */
                      <div className="flex justify-start relative mr-auto text-h3">
                        <div className="flex items-center justify-end w-full gap-1">
                          <span className="text-h4 ml-1 text-neutral-800 [font-family:var(--font-iransans)]">
                            {hasValidPrice(basePrice) ? toFaMoney(basePrice!) : "تماس بگیرید"}
                          </span>
                        </div>
                        {hasValidPrice(basePrice) ??
                          <div className="flex flex-row items-center">
                            <div className="flex" aria-hidden="false">
                              تومان
                            </div>
                          </div>
                        }
                      </div>
                    )}
                  </div>

                  {/* دکمه خرید */}
                  <div className="flex items-center">
                    {bestOffer && hasPrice ? (
                      <AddToCartButton
                        productId={productId}
                        productSlug={productSlug}
                        vendorOfferId={bestOffer.id}
                        minQuantity={minQ}
                        maxQuantity={maxQ}
                        quantityStep={stepQ}
                      />
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="w-full rounded-xl bg-slate-100 text-slate-400 px-4 py-3 
                                  text-sm cursor-not-allowed"
                        title={!bestOffer ? "پیشنهاد فعالی وجود ندارد" : "این کالا قیمت ندارد"}
                      >
                        افزودن به سبد خرید
                      </button>
                    )}
                  </div>

                  {/* پیام نبود پیشنهاد */}
                  {!bestOffer ? (
                    <div className="px-5 lg:px-0 pb-4 text-sm text-rose-600">
                      در حال حاضر پیشنهاد فعالی برای خرید این محصول موجود نیست.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          {/* Garranty Specification */}
          <div className="w-full px-4 flex items-center">
            <div className="py-3 flex grow flex items-center">
              <div className="ml-4">
                <div className="flex">
                  <ShieldCheck size={23} strokeWidth={2} className="text-icon-high-emphasis" />
                </div>
              </div>
              <div className="flex w-full">
                <p className="text-button-2 text-neutral-700">گارانتی اصالت و سلامت فیزیکی کالا</p>
              </div>
            </div>
          </div>
          <ShippingMethodRow />
        </div>

        {/* قیمت‌گذاری و نظارت */}
        <a className="w-full" target="_blank" rel="noreferrer" href="#">
          <div
            className="flex justify-between items-center lg:border-complete 
            py-2 px-5 lg:rounded-small
            border-t-[8px]
            border-[var(--color-neutral-100)]
            lg:border
            lg:border-[1px]"
          >
            <div className="flex items-center">
              <div className="flex ml-2" aria-hidden="false">
                <Info className="w-4 h-4 text-neutral-500" />
              </div>
              <span className="text-neutral-600 text-body-2">
                فرآیند قیمت گذاری و نظارت بر قیمت
              </span>
            </div>
            <div className="flex" aria-hidden="false">
              <ChevronLeft className="w-4 h-4 text-icon-high-emphasis font-semibold" />
            </div>
          </div>
        </a>
      </div>
    </div >
  );
}
