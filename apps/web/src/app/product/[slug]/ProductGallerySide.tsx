"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    Info,
    Heart,
    Share2,
    Bell,
    BarChart3,
    GitCompare,
    List,
} from "lucide-react";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import ProductGalleryModal from "./ProductGalleryModal";
import { addToCompare } from "@/modules/compare/storage";
import PriceHistoryModal from "./PriceHistoryModal";
import ProductShareModal from "./ProductShareModal";
import { useAuth } from "@/context/AuthContext";
import { myWishlistContains, toggleMyWishlist } from "@/modules/wishlist/api";
import { WishlistToast } from "@/modules/wishlist/ui/WishlistToast";

type ProductGallerySideProps = {
    productId?: string;
    primaryCategoryId?: string | null;
    categoryIds?: string[] | null;
    title?: string;
    productTitle?: string;
    mainImageUrl: string | null | undefined;
    thumbs?: string[] | null | undefined;
    sku?: string | null;
    onReportClick?: () => void;
};

function uniq(arr: string[]) {
    return Array.from(new Set((arr ?? []).filter(Boolean)));
}

export function ProductGallerySide({
    productId,
    primaryCategoryId,
    categoryIds,
    title = "تصویر محصول",
    productTitle,
    mainImageUrl,
    thumbs = [],
    sku,
    onReportClick,
}: ProductGallerySideProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();

    const images = useMemo(() => {
        const primary = mainImageUrl ? [mainImageUrl] : [];
        const merged = [...primary, ...(thumbs ?? [])].filter(Boolean) as string[];
        return uniq(merged);
    }, [mainImageUrl, thumbs]);

    const [active, setActive] = useState(0);
    const activeSrc = images[active] ?? images[0] ?? null;

    const [open, setOpen] = useState(false);

    const [openShare, setOpenShare] = useState(false);
    const [shareUrl, setShareUrl] = useState("");

    const [isInWishlist, setIsInWishlist] = useState(false);
    const [wishlistKnown, setWishlistKnown] = useState(false);
    const [toastOpen, setToastOpen] = useState(false);
    const [toastAdded, setToastAdded] = useState(false);

    const openAt = (idx: number) => {
        const next = Math.max(0, Math.min(images.length - 1, idx));
        setActive(next);
        setOpen(true);
    };

    const [openPriceChart, setOpenPriceChart] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function loadWishlistState() {
            if (!productId) return;

            if (!isAuthenticated) {
                if (mounted) {
                    setIsInWishlist(false);
                    setWishlistKnown(false);
                }
                return;
            }

            try {
                const r = await myWishlistContains(productId, null);
                if (!mounted) return;
                setIsInWishlist(!!r?.isInWishlist);
                setWishlistKnown(true);
            } catch {
                if (!mounted) return;
                setWishlistKnown(false);
            }
        }

        loadWishlistState();
        return () => {
            mounted = false;
        };
    }, [productId, isAuthenticated]);

    const onWishlistClick = async () => {
        if (!productId) return;

        if (!isAuthenticated) {
            router.push(`/login?next=${encodeURIComponent(pathname || "/")}`);
            return;
        }

        try {
            const r = await toggleMyWishlist({ productId, vendorOfferId: null });
            const next = !!r?.isInWishlist;
            setIsInWishlist(next);
            setWishlistKnown(true);
            setToastAdded(next);
            setToastOpen(true);
        } catch {
        }
    };

    const onShareClick = () => {
        const url = typeof window !== "undefined" ? window.location.href : "";
        setShareUrl(url);
        setOpenShare(true);
    };

    const onCompareClick = () => {
        if (!productId) return;

        const cat = primaryCategoryId ?? categoryIds?.[0] ?? null;
        const r = addToCompare(productId, cat);

        if (r.action === "full") {
            alert("حداکثر ۴ کالا قابل مقایسه است.");
            return;
        }

        router.push("/compare");
    };

    const chartTitle = productTitle?.trim() || title;

    return (
        <div className="lg:ml-4 shrink-0 flex flex-col-reverse lg:flex-col">
            <div className="flex flex-col items-center lg:max-w-[368px] xl:max-w-[580px] lg:block">
                <div className="flex relative w-full">
                    {/* ستون آیکن‌ها */}
                    <div className="flex lg:flex-col lg:gap-y-4 text-neutral-700 self-end lg:self-start lg:text-neutral-900">
                        <IconButton
                            title={isInWishlist ? "حذف از علاقه‌مندی" : "افزودن به علاقه‌مندی"}
                            onClick={onWishlistClick}
                            disabled={!productId}
                        >
                            <Heart
                                className={
                                    "h-6 w-6 " +
                                    (wishlistKnown && isInWishlist
                                        ? "text-[#ef394e]"
                                        : "text-neutral-700 lg:text-neutral-900")
                                }
                                fill={wishlistKnown && isInWishlist ? "currentColor" : "none"}
                            />
                        </IconButton>

                        <IconButton title="اشتراک‌گذاری" onClick={onShareClick}>
                            <Share2 className="h-6 w-6" />
                        </IconButton>

                        {/*
            <IconButton title="اطلاع‌رسانی">
              <Bell className="h-6 w-6" />
            </IconButton>
            */}

                        <IconButton title="نمودار قیمت" onClick={() => setOpenPriceChart(true)}>
                            <BarChart3 className="h-6 w-6" />
                        </IconButton>

                        <IconButton title="مقایسه" onClick={onCompareClick}>
                            <GitCompare className="h-6 w-6" />
                        </IconButton>

                        {/*
            <IconButton title="افزودن به لیست">
              <List className="h-6 w-6" />
            </IconButton>
            */}
                    </div>

                    {/* تصویر اصلی */}
                    <div className="relative flex items-center w-full">
                        <button
                            type="button"
                            className="cursor-pointer w-full"
                            aria-label="مشاهده تصویر محصول"
                            style={{ lineHeight: 0 }}
                            onClick={() => {
                                if (!activeSrc) return;
                                openAt(active);
                            }}
                        >
                            {activeSrc ? (
                                <Image
                                    src={resolveMediaUrl(activeSrc)}
                                    alt={title}
                                    width={496}
                                    height={496}
                                    className="rounded-2xl overflow-hidden inline-block"
                                    priority
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full aspect-square rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-sm text-slate-500">
                                    تصویر محصول موجود نیست
                                </div>
                            )}
                        </button>
                    </div>
                </div>

                {/* بندانگشتی‌ها */}
                {images.length > 1 && (
                    <div className="flex items-center mt-5 mb-3 w-full overflow-x-auto no-scrollbar">
                        {images.slice(0, 10).map((u, idx) => {
                            const isActive = idx === active;
                            return (
                                <button
                                    key={`${u}-${idx}`}
                                    type="button"
                                    onClick={() => openAt(idx)}
                                    className={
                                        "cursor-pointer rounded border p-1 ml-2 shrink-0 " +
                                        (isActive
                                            ? "border-brand-600"
                                            : "border-neutral-200 hover:border-neutral-300")
                                    }
                                    aria-label={`تصویر ${idx + 1}`}
                                    style={{ lineHeight: 0 }}
                                >
                                    <Image
                                        src={resolveMediaUrl(u)}
                                        alt={`تصویر ${idx + 1}`}
                                        width={72}
                                        height={72}
                                        className="inline-block object-contain"
                                        unoptimized
                                    />
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className="hidden lg:flex items-center w-full">
                    <button
                        type="button"
                        onClick={onReportClick}
                        className="rounded cursor-pointer ml-9 flex items-center"
                    >
                        <Info className="h-[18px] w-[18px] text-neutral-400" />
                        <span className="mr-2 text-[12px] leading-5 text-neutral-500 [font-family:var(--font-iransans)]">
                            گزارش مشخصات کالا یا موارد قانونی
                        </span>
                    </button>

                    <span className="text-[11px] leading-5 text-neutral-400">
                        {sku ? ` ${sku}` : ""}
                    </span>
                </div>
            </div>

            <ProductGalleryModal
                open={open}
                onClose={() => setOpen(false)}
                title={title}
                images={images}
                initialIndex={active}
            />

            {productId && (
                <PriceHistoryModal
                    open={openPriceChart}
                    onClose={() => setOpenPriceChart(false)}
                    productId={productId}
                    productTitle={chartTitle}
                />
            )}

            <ProductShareModal
                open={openShare}
                onClose={() => setOpenShare(false)}
                url={shareUrl}
            />

            <WishlistToast
                open={toastOpen}
                onClose={() => setToastOpen(false)}
                added={toastAdded}
            />
        </div>
    );
}

function IconButton({
    children,
    title,
    onClick,
    disabled,
}: {
    children: React.ReactNode;
    title: string;
    onClick?: () => void;
    disabled?: boolean;
}) {
    return (
        <div className="relative z-[1] whitespace-nowrap ml-6 lg:ml-4 group">
            <button
                type="button"
                title={title}
                aria-label={title}
                onClick={onClick}
                disabled={disabled}
                className={
                    "flex ml-5 lg:ml-0 " +
                    (disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer")
                }
            >
                {children}
            </button>

            <div
                role="tooltip"
                className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[calc(100%+12px)]
        rounded-lg bg-[#3f4064] px-2.5 py-1.5 text-[11px] text-white opacity-0 shadow-md
        transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
            >
                {title}
                <span
                    className="absolute right-[-4px] top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-[#3f4064]"
                    aria-hidden="true"
                />
            </div>
        </div>
    );
}