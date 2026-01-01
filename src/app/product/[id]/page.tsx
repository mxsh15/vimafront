import Link from "next/link";
import { Suspense } from "react";
import { getPublicProductCore } from "@/modules/product/public-api.server";
import ProductOffersPanel from "./ProductOffersPanel";
import ProductOffersSkeleton from "./ProductOffersSkeleton";

export const metadata = { title: "جزئیات محصول" };

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getPublicProductCore(id);

  return (
    <div className="container mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{product.title}</h1>
        <Link
          href="/shop"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          ← برگشت به فروشگاه
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500 font-mono">
            ID: {product.id}
          </div>

          {product.descriptionHtml ? (
            <div
              className="mt-4 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          ) : (
            <div className="mt-4 text-sm text-slate-600">
              توضیحات این محصول ثبت نشده است.
            </div>
          )}
        </div>

        <Suspense fallback={<ProductOffersSkeleton />}>
          <ProductOffersPanel productId={product.id} />
        </Suspense>
      </div>
    </div>
  );
}
