import Link from "next/link";
import { AddToCartButton } from "@/modules/cart/ui/AddToCartButton";
import { getPublicProductOffersBySlug } from "@/modules/product/public-api.server";
import { normalizeSlugParam } from "@/modules/product/slug";
import { getPublicStoreSettings } from "@/modules/settings/public-api.server";

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
    .filter((o) => !o.manageStock || o.stockQuantity > 0)
    .sort((a, b) => {
      const ap = Number(a.discountPrice ?? a.price);
      const bp = Number(b.discountPrice ?? b.price);
      return ap - bp;
    });

  const bestOffer = buyableOffers[0] ?? null;
  const otherOffers = buyableOffers.slice(1, 5);

  // قیمت نهایی
  const finalPrice = bestOffer ? (bestOffer.discountPrice ?? bestOffer.price) : null;
  const hasPrice = hasValidPrice(finalPrice);

  // ===== حالت تک‌فروشنده (چندفروشندگی خاموش) =====
  if (!multiVendorEnabled) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-soft">
        <div className="text-sm font-semibold">قیمت کالا</div>

        {!bestOffer ? (
          <div className="text-sm text-slate-700">تماس بگیرید</div>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-200 p-3">
              <div className="text-xs text-slate-500">قیمت</div>

              <div className="mt-2 text-lg font-bold">
                {hasPrice ? `${toFaMoney(finalPrice!)} تومان` : "تماس بگیرید"}
              </div>

              {hasValidPrice(bestOffer.discountPrice) && hasValidPrice(bestOffer.price) ? (
                <div className="text-xs text-slate-500 line-through">
                  {toFaMoney(bestOffer.price)} تومان
                </div>
              ) : null}
            </div>

            {/* اگر قیمت داریم اجازه افزودن به سبد بده، اگر نداریم دکمه غیرفعال/یا حذف */}
            {hasPrice ? (
              <AddToCartButton
                productId={productId}
                productSlug={productSlug}
                vendorOfferId={bestOffer.id}
              />
            ) : (
              <button
                type="button"
                disabled
                className="w-full rounded-xl bg-slate-100 text-slate-400 px-4 py-3 text-sm cursor-not-allowed"
                title="این کالا قیمت ندارد"
              >
                افزودن به سبد خرید
              </button>
            )}

            <Link
              href="/cart"
              className="block text-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              مشاهده سبد خرید
            </Link>
          </>
        )}
      </div>
    );
  }

  // ===== حالت چندفروشنده (روشن) =====
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-soft">
      <div className="text-sm font-semibold">فروشندگان این کالا</div>

      {!bestOffer ? (
        <div className="text-sm text-rose-600">
          در حال حاضر پیشنهاد فعالی برای خرید این محصول موجود نیست.
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">بهترین قیمت از</div>
            <div className="mt-1 text-sm font-semibold">{bestOffer.vendorName}</div>

            <div className="mt-2 text-lg font-bold">
              {hasValidPrice(bestOffer.discountPrice ?? bestOffer.price)
                ? `${toFaMoney(bestOffer.discountPrice ?? bestOffer.price)} تومان`
                : "تماس بگیرید"}
            </div>

            {hasValidPrice(bestOffer.discountPrice) && hasValidPrice(bestOffer.price) ? (
              <div className="text-xs text-slate-500 line-through">
                {toFaMoney(bestOffer.price)} تومان
              </div>
            ) : null}
          </div>

          <AddToCartButton
            productId={productId}
            productSlug={productSlug}
            vendorOfferId={bestOffer.id}
          />

          {otherOffers.length ? (
            <div className="rounded-2xl border border-slate-200 p-3">
              <div className="text-xs text-slate-500">سایر فروشندگان</div>
              <div className="mt-2 space-y-2">
                {otherOffers.map((o) => (
                  <div key={o.id} className="flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-600 line-clamp-1">
                      {o.vendorName}
                    </div>
                    <div className="text-xs font-semibold">
                      {hasValidPrice(o.discountPrice ?? o.price)
                        ? `${toFaMoney(o.discountPrice ?? o.price)} تومان`
                        : "تماس بگیرید"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <Link
            href="/cart"
            className="block text-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            مشاهده سبد خرید
          </Link>
        </>
      )}
    </div>
  );
}
