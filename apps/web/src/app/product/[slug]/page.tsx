import { Suspense } from "react";
import { headers } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";

import { getPublicProductDetail } from "@/modules/product/public-api.server";
import { normalizeSlugParam } from "@/modules/product/slug";
import { getProductReviews } from "@/modules/review/api";

import type { PdpComment } from "./PdpCommentsList";
import ProductDesktopView from "./ProductDesktopView";
import ProductMobileView from "./ProductMobileView";
import { isMobileRequest } from "@/lib/device/isMobileRequest";
import ResponsiveLayoutSwitcher from "./ResponsiveLayoutSwitcher";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlugParam(rawSlug);

  try {
    const product = await getPublicProductDetail(slug);
    return { title: product.title };
  } catch {
    return { title: "محصول" };
  }
}

function toFaNumber(n: number) {
  return Number(n || 0).toLocaleString("fa-IR");
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}


async function ProductContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  noStore();

  const { slug: rawSlug } = await params;
  const slug = normalizeSlugParam(rawSlug);

  const h = await headers();
  const ua = h.get("user-agent");
  const chMobile = h.get("sec-ch-ua-mobile");
  const isMobile = isMobileRequest(ua, chMobile);

  const product = await getPublicProductDetail(slug);
  const approvedReviews = await getProductReviews(product.id).catch(() => []);

  const comments: PdpComment[] = approvedReviews.map((r) => ({
    id: r.id,
    userDisplayName: r.userFullName,
    isBuyer: r.isVerifiedPurchase,
    createdAt: r.createdAtUtc,
    rating: r.rating,
    text: r.comment,
    likeCount: r.likeCount ?? 0,
    dislikeCount: r.dislikeCount ?? 0,
  }));

  const ratingAverage = clamp(Number(product.ratingAverage ?? 0), 0, 5);
  const ratingAverageText = ratingAverage
    ? ratingAverage.toLocaleString("fa-IR", { maximumFractionDigits: 1 })
    : "0";

  const buyersCountText = toFaNumber(Number(product.ratingCount ?? 0));
  const commentsCountText = toFaNumber(comments.length);

  const headerCrumbs = [{ title: "ویماشاپ", href: "/" }];

  const groups = product.categoryBreadcrumbs ?? [];
  const primaryId = product.primaryCategoryId ?? null;

  const primaryPath =
    primaryId
      ? groups.find((p: any) => (p?.[p.length - 1]?.id ?? null) === primaryId)
      : undefined;

  const deepestPath =
    groups.reduce<any | null>(
      (best: any, cur: any) =>
        !best || (cur?.length ?? 0) > best.length ? cur : best,
      null
    ) ?? undefined;

  const bestPath = deepestPath ?? primaryPath;

  const breadcrumbItems = bestPath
    ? [
      ...headerCrumbs,
      ...bestPath.map((c: any) => ({
        title: c.title,
        href: `/category/${c.slug}`,
      })),
      { title: product.title, href: null },
    ]
    : [...headerCrumbs, { title: product.title, href: null }];

  return (
    <ResponsiveLayoutSwitcher
      serverIsMobile={isMobile}
      breakpointPx={1024}
      mobileView={
        <ProductMobileView
          product={product}
          comments={comments}
          ratingAverageText={ratingAverageText}
          buyersCountText={buyersCountText}
          commentsCountText={commentsCountText}
        />
      }
      desktopView={
        <ProductDesktopView
          product={product}
          comments={comments}
          ratingAverageText={ratingAverageText}
          buyersCountText={buyersCountText}
          commentsCountText={commentsCountText}
          breadcrumbItems={breadcrumbItems}
        />
      }
    />
  );
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<div className="flex justify-center p-12">در حال بارگذاری اطلاعات محصول...</div>}>
      <ProductContent params={params} />
    </Suspense>
  );
}