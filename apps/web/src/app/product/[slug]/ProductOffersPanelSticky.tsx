import { AddToCartButton } from "@/modules/cart/ui/AddToCartButton";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import { getPublicProductOffersBySlug } from "@/modules/product/public-api.server";
import { normalizeSlugParam } from "@/modules/product/slug";
import { getPublicStoreSettings } from "@/modules/settings/public-api.server";
import { Store, ShieldCheck, PackageCheck } from "lucide-react";
import Image from "next/image";

function toFaMoney(n: number) {
    return Number(n).toLocaleString("fa-IR");
}

function hasValidPrice(n: unknown): n is number {
    return typeof n === "number" && isFinite(n) && n > 0;
}

export default async function ProductOffersPanelSticky({
    productId,
    productSlug,
    productTitle,
    productImageUrl,
}: {
    productId: string;
    productSlug: string;
    productTitle: string;
    productImageUrl?: string | null;
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

    const imageSrc = productImageUrl && resolveMediaUrl(productImageUrl)
        ? resolveMediaUrl(productImageUrl)
        : "/images/placeholder-product.png";

    return (
        <>
            <div className="flex border-b border-neutral-200 pb-3 mb-3">
                <div className="rounded shrink-0 max-[80px] w-[80px] h-[80px] leading-none 
                                flex items-center justify-center">
                    <Image
                        src={imageSrc}
                        alt={productTitle}
                        className="object-contain"
                        width={80}
                        height={80}
                        priority
                        unoptimized
                    />
                </div>
                <div className="flex flex-col mr-5">
                    <p className="ellipsis-2">{productTitle}</p>
                </div>
            </div>
            <div className="flex mb-2">
                <div className="ml-2 flex items-center justify-center">
                    <div className="relative">
                        <div className="flex">
                            <Store size={18} className="text-[var(--color-icon-high-emphasis)]" />
                        </div>
                    </div>
                </div>
                <div className="text-neutral-700 text-body-2 [font-family:var(--font-iransans)]">{sellerName}</div>
            </div>
            <div className="flex mb-2">
                <div className="ml-2 flex items-center justify-center">
                    <div className="flex">
                        <ShieldCheck size={18} className="text-[var(--color-icon-high-emphasis)]" />
                    </div>
                </div>
                <div className="text-neutral-700 text-body-2 [font-family:var(--font-iransans)]">گارانتی اصالت و سلامت فیزیکی کالا</div>
            </div>
            <div className="flex mb-2">
                <div className="ml-2 flex items-center justify-center">
                    <div className="flex">
                        <PackageCheck size={23} className="text-[var(--color-icon-secondary)]" />
                    </div>
                </div>
                <div className="text-neutral-700 text-body-2 [font-family:var(--font-iransans)]">موجود در انبار</div>
            </div>
            <div className="relative w-full mt-1">
                <div className="w-full z-3 bg-neutral-000 shadow-fab-button lg:shadow-none 
                                bg-white shadow-md lg:bg-transparent lg:shadow-none"
                >
                    <div>
                        <div className="flex items-center mb-1">
                            <div className="flex justify-start relative flex-col items-end mr-auto text-h3">
                                <div className="flex items-center justify-end w-full gap-1">
                                    <span className="line-through text-body-2 ml-1 text-neutral-300
                                                    [font-family:var(--font-iransans)]"
                                    >
                                        {toFaMoney(basePrice!)}
                                    </span>
                                    <div className="px-1 text-white flex items-center justify-center 
                                                    bg-hint-object-error shrink-0 mr-1 mb-1 
                                                    w-[34px] h-[20px] rounded-[16px] font-normal"
                                    >
                                        <span className="text-body2-strong [font-family:var(--font-iransans)]">
                                            {discountPercent.toLocaleString("fa-IR")}٪
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-row items-center">
                                    <span className="ml-1 text-neutral-800 text-h4-compact
                                                    [font-family:var(--font-iransans)] font-semibold"
                                    >
                                        {toFaMoney(discountPrice!)}
                                    </span>
                                    <div className="flex [font-family:var(--font-iransans)] text-[.6rem]" aria-hidden="false">
                                        تومان
                                    </div>
                                </div>
                            </div>
                        </div>
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
                    </div>
                </div>
            </div>
        </>
    );
}
