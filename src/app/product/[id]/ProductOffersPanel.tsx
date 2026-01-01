import Link from "next/link";
import { AddToCartButton } from "@/modules/cart/ui/AddToCartButton";
import { getPublicProductOffers } from "@/modules/product/public-api.server";

function toFaMoney(n: number) {
  return Number(n).toLocaleString("fa-IR");
}

export default async function ProductOffersPanel({
  productId,
}: {
  productId: string;
}) {
  const { vendorOffers } = await getPublicProductOffers(productId);

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

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="text-sm font-semibold">خرید محصول</div>

      {!bestOffer ? (
        <div className="text-sm text-rose-600">
          در حال حاضر پیشنهاد فعالی برای خرید این محصول موجود نیست.
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">بهترین قیمت از</div>
            <div className="mt-1 text-sm font-semibold">
              {bestOffer.vendorName}
            </div>

            <div className="mt-2 text-lg font-bold">
              {toFaMoney(bestOffer.discountPrice ?? bestOffer.price)} تومان
            </div>

            {bestOffer.discountPrice ? (
              <div className="text-xs text-slate-500 line-through">
                {toFaMoney(bestOffer.price)} تومان
              </div>
            ) : null}

            {bestOffer.manageStock ? (
              <div className="mt-2 text-xs text-slate-600">
                موجودی: {bestOffer.stockQuantity}
              </div>
            ) : (
              <div className="mt-2 text-xs text-slate-600">
                موجودی کنترل نمی‌شود
              </div>
            )}
          </div>

          <AddToCartButton productId={productId} vendorOfferId={bestOffer.id} />

          <Link
            href="/cart"
            className="block text-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            مشاهده سبد خرید
          </Link>
        </>
      )}

      {buyableOffers.length > 1 ? (
        <div className="pt-3 border-t border-slate-200">
          <div className="text-xs font-semibold text-slate-700 mb-2">
            سایر فروشندگان
          </div>

          <div className="space-y-2">
            {buyableOffers.slice(1, 6).map((o) => (
              <div
                key={o.id}
                className="rounded-xl border border-slate-200 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{o.vendorName}</div>
                    <div className="text-xs text-slate-500 font-mono">
                      {o.id}
                    </div>
                  </div>
                  <div className="text-sm font-bold">
                    {toFaMoney(o.discountPrice ?? o.price)} تومان
                  </div>
                </div>

                <div className="mt-2">
                  <AddToCartButton productId={productId} vendorOfferId={o.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
