import Link from "next/link";
import { Suspense } from "react";
import { getPublicProductDetail } from "@/modules/product/public-api.server";
import ProductOffersPanel from "./ProductOffersPanel";
import ProductOffersSkeleton from "./ProductOffersSkeleton";
import { normalizeSlugParam } from "@/modules/product/slug";
import ProductGallery from "./ProductGallery";
import SimilarProductsRow from "./SimilarProductsRow";
import ProductQuestionsSection from "./ProductQuestionsSection";
import ProductBreadcrumbs from "./ProductBreadcrumbs";
import { ProductGallerySide } from "./ProductGallerySide";

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

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlugParam(rawSlug);
  const product = await getPublicProductDetail(slug);
  const features = (product.features ?? []).slice(0, 8);
  const specs = product.specs ?? [];
  const rating = clamp(Math.round(Number(product.ratingAverage ?? 0)), 0, 5);
  const ratingCount = Number(product.ratingCount ?? 0);
  const headerCrumbs = [
    { title: "ویماشاپ", href: "/" },
    { title: "فروشگاه", href: "/shop" },
  ];
  const groups = product.categoryBreadcrumbs ?? [];
  const primaryId = product.primaryCategoryId ?? null;
  const primaryPath =
    primaryId
      ? groups.find((p) => (p?.[p.length - 1]?.id ?? null) === primaryId)
      : undefined;
  const deepestPath =
    groups.reduce<typeof groups[number] | null>(
      (best, cur) => (!best || (cur?.length ?? 0) > best.length ? cur : best),
      null
    ) ?? undefined;
  const bestPath = deepestPath ?? primaryPath;
  const breadcrumbItems = bestPath
    ? [
      ...headerCrumbs,
      ...bestPath.map((c) => ({ title: c.title, href: `/category/${c.slug}` })),
      { title: product.title, href: null },
    ]
    : [...headerCrumbs, { title: product.title, href: null }];

  return (
    <div className="bg-white text-sm text-[#3f4064]" dir="rtl" lang="fa">

      {/* Breadcrumbs */}
      <ProductBreadcrumbs items={breadcrumbItems} />

      <div className="flex flex-col lg:flex-row">

        {/* Right Column */}
        <ProductGallerySide
          mainImageUrl={product.primaryImageUrl}
          thumbs={product.galleryImageUrls ?? []}
          sku={product.sku ?? null}
        />
        {/* Left Column */}
        <div className="grow min-w-0">

        </div>
      </div>

      <main className="mx-auto max-w-main px-4 2xl:px-0 pb-12">
        {/* Top: gallery + info + buy box */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Right: Gallery (sticky) */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <div className="relative">

                <div className="absolute left-0 top-0 z-10 flex flex-col gap-4 text-gray-400">
                  <button className="hover:text-[#ef394e]" type="button" title="علاقه‌مندی">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                  </button>
                  <button className="hover:text-gray-800" type="button" title="اشتراک‌گذاری">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                    </svg>
                  </button>
                  <button className="hover:text-gray-800" type="button" title="اعلان موجودی">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                    </svg>
                  </button>
                  <button className="hover:text-gray-800" type="button" title="نمودار قیمت">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Info */}
          <div className="lg:col-span-5 pt-2 space-y-4">
            {product.brandTitle ? (
              <div className="text-sky-500 text-sm mb-1 font-bold">
                برند: {product.brandTitle}
              </div>
            ) : null}

            <h1 className="text-xl font-bold leading-8 text-gray-800">
              {product.title}
            </h1>

            {/* subtitle / sku line (ltr like sample) */}
            {product.sku ? (
              <div className="text-gray-400 text-sm border-b pb-4" style={{ direction: "ltr", textAlign: "right" }}>
                SKU: {product.sku}
              </div>
            ) : (
              <div className="border-b pb-4" />
            )}

            {/* rating row */}
            <div className="flex items-center gap-2 mb-2 text-sm">
              <div className="flex items-center text-yellow-400">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={i < rating ? "" : "text-gray-300"}>★</span>
                ))}
              </div>

              {ratingCount > 0 ? (
                <span className="text-gray-400">
                  ({toFaNumber(ratingCount)})
                </span>
              ) : (
                <span className="text-gray-400">(بدون امتیاز)</span>
              )}

              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <a href="#comments" className="text-sky-500">ارسال دیدگاه</a>
            </div>

            {/* Features (Digikala-like bullet list) */}
            <div className="mb-2">
              <div className="font-bold text-base mb-3">ویژگی‌ها</div>

              {features.length ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600">
                  {features.map((f, i) => (
                    <li key={f.title + i} className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span className="line-clamp-1">
                        <span className="text-gray-400">{f.title}:</span>{" "}
                        {f.value ?? "-"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-slate-600">
                  (در پروژه فعلی) ویژگی‌های محصول برای نمایش در این قسمت ثبت نشده.
                </div>
              )}

              <div className="mt-3">
                <a href="#specs" className="text-xs text-sky-500 hover:text-sky-600">
                  مشاهده مشخصات
                </a>
              </div>
            </div>

            {/* Similar products row (همون کامپوننت خودت) */}
            <div className="pt-2">
              <SimilarProductsRow categoryIds={product.categoryIds} />
            </div>

            {/* Policy note like sample */}
            <div className="mt-2 flex items-start gap-2 text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-gray-400 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <span>
                امکان برگشت کالا با دلیل &quot;انصراف از خرید&quot; تنها در صورتی مورد قبول است که کالا در شرایط اولیه باشد.
              </span>
            </div>
          </div>

          {/* Left: Buy box */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-28">
              <div className="bg-[#f0f0f1]/30 border border-gray-200 rounded-lg p-4">
                <Suspense fallback={<ProductOffersSkeleton />}>
                  <ProductOffersPanel productId={product.id} productSlug={slug} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs (sticky like single-product) */}
        <div className="mt-10 border-b sticky top-[72px] bg-white z-20">
          <div className="flex gap-8 text-sm font-bold text-gray-500 overflow-x-auto no-scrollbar">
            <a href="#intro" className="pb-3 whitespace-nowrap hover:text-[#3f4064]">
              معرفی
            </a>
            <a
              href="#specs"
              className="text-[#ef394e] border-b-2 border-[#ef394e] pb-3 whitespace-nowrap"
            >
              مشخصات
            </a>
            <a href="#comments" className="pb-3 whitespace-nowrap hover:text-[#3f4064]">
              دیدگاه‌ها
            </a>
            <a href="#qa" className="pb-3 whitespace-nowrap hover:text-[#3f4064]">
              پرسش‌ها
            </a>
          </div>
        </div>

        {/* Content */}
        <div className="pt-6 space-y-10">
          <section id="intro">
            <div className="text-sm font-semibold">معرفی</div>
            {product.descriptionHtml ? (
              <div
                className="mt-3 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            ) : (
              <div className="mt-3 text-sm text-slate-600">
                توضیحات این محصول ثبت نشده است.
              </div>
            )}
          </section>

          <section id="specs" className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-3">
              <h4 className="font-bold text-lg mb-2">مشخصات</h4>
            </div>

            <div className="md:col-span-9">
              {specs.length ? (
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  {specs.map((s, i) => (
                    <div key={s.title + i}>
                      <div className="flex">
                        <div className="w-1/3 text-gray-400 text-xs">{s.title}</div>
                        <div className="w-2/3 text-gray-700 font-medium text-xs">
                          {s.value ?? "-"}
                        </div>
                      </div>
                      {i !== specs.length - 1 && <div className="border-t border-gray-200 mt-4" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 text-sm text-slate-600">
                  (در پروژه فعلی) مشخصات فنی برای این محصول ثبت نشده.
                </div>
              )}
            </div>
          </section>

          <section id="comments">
            <div className="text-sm font-semibold">دیدگاه‌ها</div>
            <div className="mt-3 text-sm text-slate-600">
              (در پروژه فعلی) سیستم دیدگاه/نظرات محصول در فرانت پیاده‌سازی نشده.
            </div>
          </section>

          <div id="qa">
            <ProductQuestionsSection productId={product.id} />
          </div>
        </div>
      </main>
    </div>
  );
}
