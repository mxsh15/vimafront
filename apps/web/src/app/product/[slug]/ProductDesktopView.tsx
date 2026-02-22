import { Suspense } from "react";
import type { PdpComment } from "./PdpCommentsList";
import ProductBreadcrumbs from "./ProductBreadcrumbs";
import { ProductGallerySide } from "./ProductGallerySide";
import ProductOffersPanel from "./ProductOffersPanel";
import ProductOffersSkeleton from "./ProductOffersSkeleton";
import SimilarProductsRow from "./SimilarProductsRow";
import PdpStickyTabs from "./PdpStickyTabs";
import StickyTopCalculator from "./StickyTopCalculator";
import { PdpSomeInfoNoSwiper } from "./PdpSomeInfoNoSwiper";
import PdpDescriptionToggle from "./PdpDescriptionToggle";
import PdpFeaturesToggle from "./PdpFeaturesToggle";
import PdpCommentsSection from "./PdpCommentsSection";
import SubmitReviewButton from "./SubmitReviewButton";
import ProductQuestionsSection from "./ProductQuestionsSection";
import ProductOffersPanelSticky from "./ProductOffersPanelSticky";
import { ChevronLeft, Info } from "lucide-react";

function toFaNumber(n: number) {
  return Number(n || 0).toLocaleString("fa-IR");
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function pickText(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
}

function getSpecLabel(spec: any): string {
  return (
    pickText(spec?.title) ||
    pickText(spec?.name) ||
    pickText(spec?.key) ||
    pickText(spec?.label) ||
    ""
  );
}

function getSpecValue(spec: any): string {
  const direct =
    pickText(spec?.value) ||
    pickText(spec?.val) ||
    pickText(spec?.text) ||
    pickText(spec?.displayValue);

  if (direct) return direct;

  if (Array.isArray(spec?.values)) {
    const joined = spec.values
      .map((x: any) => pickText(x))
      .filter(Boolean)
      .join("، ");
    return joined;
  }

  return "";
}

export default function ProductDesktopView(props: {
  product: any;
  comments: PdpComment[];
  ratingAverageText: string;
  buyersCountText: string;
  commentsCountText: string;
  breadcrumbItems: Array<{ title: string; href: string | null }>;
}) {
  const {
    product,
    comments,
    ratingAverageText,
    buyersCountText,
    commentsCountText,
    breadcrumbItems,
  } = props;

  const slug = product?.slug ?? "";

  const ratingAverage = clamp(Number(product?.ratingAverage ?? 0), 0, 5);
  const buyersCount = Number(product?.ratingCount ?? 0);

  const features =
    (product?.features?.length ? product.features : product?.specs) ?? [];
  const specs = product?.specs ?? [];
  const specsPreview = (specs ?? []).slice(0, 8);
  const hasMoreSpecs = (specs?.length ?? 0) > 8;

  const bestPath = product?.categoryBreadcrumbs?.[0] ?? null;
  const categoryTitle =
    bestPath?.[bestPath.length - 1]?.title ??
    product?.primaryCategoryTitle ??
    "این گروه";

  return (
    <div className="bg-white text-[#111827]" dir="rtl" lang="fa">
      <main className="mx-auto max-w-main pb-12 lg:px-5">
        {/* breadcrumbs section */}
        <ProductBreadcrumbs items={breadcrumbItems} />

        {/* product section */}
        <section className="flex flex-col lg:flex-row">
          <ProductGallerySide
            productId={product.id}
            productTitle={product.title}
            title={product.title}
            mainImageUrl={product.primaryImageUrl}
            thumbs={product.galleryImageUrls ?? []}
            sku={product.sku}
            primaryCategoryId={product.primaryCategoryId}
            categoryIds={product.categoryIds ?? []}
          />

          <div className="grow min-w-0">
            <div className="flex items-center w-full px-5 lg:px-0">
              <div>
                <div className="flex items-center">
                  <nav className="flex items-center">
                    <a href="/brand/elegance-ax/">
                      <span className="text-secondary-500 text-body1-strong">
                        {product.brandTitle ?? "برند نامشخص"}
                      </span>
                    </a>
                    <a href="/search/category-men-analouge-watches/elegance-ax/">
                      <div className="flex items-center">
                        <p className="text-neutral-300 mx-2"> / </p>
                        <p className="text-secondary-500 text-body1-strong">
                          {product.title}
                        </p>
                      </div>
                    </a>
                  </nav>
                </div>

                <h1 className="text-h4 text-neutral-900 mb-2 pointer-events-none">
                  {product.title}
                </h1>
              </div>
            </div>

            <div className="info-grid gap-x-6 lg:gap-x-6">
              <div className="w-full flex flex-col gap-3 justify-center items-start lg:min-w-[300px] info-grid">
                <div className="bg-neutral-200 grow h-[1px] w-full" />

                <div className="w-full flex items-center flex-wrap">
                  <div className="flex items-center">
                    <div
                      aria-hidden="false"
                      aria-label="امتیاز"
                      className="w-4 h-4 leading-none w-[16px] h-[16px] leading-[0]"
                    >
                      <img
                        className="w-full inline-block object-contain"
                        src="/images/star-yellow.webp"
                        width="16"
                        height="16"
                        alt="امتیاز"
                        title=""
                      />
                    </div>

                    <p className="mr-1 text-body-2">
                      {ratingAverage
                        ? ratingAverageText
                        : "0"}
                    </p>

                    <p className="mr-1 text-caption text-neutral-300 whitespace-nowrap">
                      (امتیاز {buyersCountText}{" "}
                      {buyersCount === 1 ? "کاربر" : "کاربر"})
                    </p>
                  </div>

                  <div className="w-full lg:w-auto lg:overflow-hidden overflow-x-auto hide-scrollbar px-5 lg:px-1.5">
                    <div className="flex items-center gap-1.5 w-full">
                      <div className="flex items-center">
                        <a
                          href="#commentSection"
                          className="inline-flex items-center text-button-secondary text-body-2 py-1"
                        >
                          <span className="bg-gradient-silver flex item-center text-body2-strong pr-2 pl-1 text-icon-high-emphasis rounded-lg whitespace-nowrap [font-family:var(--font-iransans)]">
                            {commentsCountText} دیدگاه
                            <div className="flex items-center" aria-hidden="false">
                              <ChevronLeft className="w-3 h-3 text-icon-high-emphasis cube-font-icon" />
                            </div>
                          </span>
                        </a>
                      </div>

                      <span className="inline-flex items-center text-icon-high-emphasis text-body-2 py-1 pl-5">
                        <a
                          href="#questionsSection"
                          className="inline-flex items-center text-button-secondary text-body-2 py-1"
                        >
                          <span className="bg-gradient-silver flex item-center text-body2-strong pr-2 pl-1 text-icon-high-emphasis rounded-lg whitespace-nowrap [font-family:var(--font-iransans)]">
                            {toFaNumber(product.questionCount ?? 0)} پرسش
                            <div className="flex items-center" aria-hidden="false">
                              <ChevronLeft className="w-3 h-3 text-icon-high-emphasis cube-font-icon" />
                            </div>
                          </span>
                        </a>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* specs/feature preview */}
              <div className="area-spec">
                <div className="w-full pt-2">
                  <div className="break-words py-3">
                    <div className="flex items-center grow">
                      <p className="grow text-h5-180">
                        <span className="relative">ویژگی ها</span>
                      </p>
                    </div>
                  </div>

                  <div className="overflow-auto hide-scrollbar">
                    <ul className="!pb-0 flex gap-1 w-max lg:w-auto lg:gap-2 mt-2 lg:mt-0 lg:grid lg:grid-cols-3 lg:overflow-hidden">
                      {specsPreview.length ? (
                        specsPreview.map((s: any, idx: number) => {
                          const label = getSpecLabel(s);
                          const value = getSpecValue(s);

                          if (!label && !value) return null;

                          return (
                            <li
                              key={s?.id ?? `${label}-${value}-${idx}`}
                              className="flex flex-col items-start justify-start bg-neutral-100 p-2 rounded-md"
                            >
                              <div className="flex flex-col gap-2 max-w-[150px]">
                                <div>
                                  <p className="text-neutral-500 text-body-2 !leading-none lg:!leading-7 lg:break-all lg:overflow-hidden ellipsis-1">
                                    {label || "—"}
                                  </p>
                                  <p className="text-body2-strong !leading-none lg:!leading-7 text-neutral-700 break-all lg:overflow-hidden ellipsis-1">
                                    {value || "—"}
                                  </p>
                                </div>
                              </div>
                            </li>
                          );
                        })
                      ) : (
                        <li className="text-body-2 text-neutral-500 py-2">
                          ویژگی‌ای برای این کالا ثبت نشده است
                        </li>
                      )}
                    </ul>
                  </div>

                  {hasMoreSpecs ? (
                    <div className="flex justify-center items-center gap-4 mt-4">
                      <hr className="grow border-0 border-t border-neutral-200" />
                      <a
                        href="#specification"
                        className="relative flex items-center select-none
                                  bg-transparent
                                  text-[var(--color-button-black)]
                                  border border-[var(--color-neutral-200)]
                                  text-[0.8rem] font-medium leading-[2.17]
                                  rounded-[var(--radius-global)]
                                  py-[calc(2*var(--spacing-base))]
                                  px-[calc(4*var(--spacing-base))]
                                  h-10
                                  font-semibold"
                      >
                        <div className="flex items-center justify-center relative grow [font-family:var(--font-iransans)] font-semibold">
                          مشاهده همه ویژگی&zwnj;ها
                          <div className="flex mr-2" aria-hidden="false">
                            <ChevronLeft className="w-4 h-4 text-icon-high-emphasis font-semibold" />
                          </div>
                        </div>
                      </a>
                      <hr className="grow border-0 border-t border-neutral-200" />
                    </div>
                  ) : null}
                </div>

                <div className="rounded my-3 mx-5 lg:mx-0">
                  <div className="flex">
                    <div className="flex mt-1" aria-hidden="false">
                      <Info className="w-4 h-4 text-neutral-500" />
                    </div>
                    <span className="mr-2 text-body-2 text-neutral-500 [font-family:var(--font-iransans)]">
                      درخواست مرجوع کردن کالا در گروه {categoryTitle} با دلیل
                      "انصراف از خرید" تنها در صورتی قابل تایید است که کالا در
                      شرایط اولیه باشد (در صورت پلمب بودن، کالا نباید باز شده
                      باشد.)
                    </span>
                  </div>
                </div>
              </div>

              <Suspense fallback={<ProductOffersSkeleton />}>
                <ProductOffersPanel productId={product.id} productSlug={slug} />
              </Suspense>
            </div>
          </div>
        </section>

        {/* icons section */}
        <section
          className="border-t border-t-[var(--color-neutral-100)] px-3 items-center justify-between pt-3 pb-7
                     flex lg:mt-3 border-b-[4px] border-b-[var(--color-neutral-100)]"
        >
          <div className="w-full flex gap-y-4 lg:gap-y-2 mx-auto justify-between">
            <PdpSomeInfoNoSwiper />
          </div>
        </section>

        {/* sellers section */}
        <section id="seller-list" className="mt-4">
          <div className="rounded-[20px] border border-[#e5e7eb] bg-white p-4">
            <h2 className="text-base font-extrabold text-[#111827]">
              فروشندگان این کالا
            </h2>
            <div className="mt-3 rounded-[20px] border border-[#e5e7eb] p-4 text-sm text-[#6b7280]">
              اطلاعات فروشندگان از پنل خرید بالا قابل مشاهده است.
            </div>
          </div>
        </section>

        {/* similar products section */}
        <section id="similar-products">
          <div>
            <div
              className="flex flex-col relative overflow-hidden w-full pt-2
                         border border-[var(--color-neutral-200)] lg:rounded-lg lg:mt-4 pb-3 w-screen lg:w-auto
                         border-b-[4px] border-b-[var(--color-neutral-100)]"
            >
              <div className="break-words py-3 px-5 py-2 user-select-none">
                <div className="flex items-center grow">
                  <div className="grow text-h5 text-neutral-900">
                    <span className="relative [font-family:var(--font-iransans)] font-medium">
                      کالاهای مشابه
                    </span>
                  </div>
                </div>
                <div className="mt-2 w-[4rem] h-[.15rem] bg-[var(--color-primary-700)]" />
              </div>

              <div>
                <SimilarProductsRow
                  categoryIds={product.categoryIds}
                  excludeProductId={product.id}
                />
              </div>
            </div>
          </div>
        </section>

        {/* tabs */}
        <StickyTopCalculator />
        <section id="product-tabs">
          <div>
            <PdpStickyTabs
              stickyTop={64}
              tabs={[
                { id: "PdpShortReview", title: "معرفی" },
                { id: "specification", title: "مشخصات" },
                { id: "commentSection", title: "دیدگاه ها" },
                { id: "questionsSection", title: "پرسش ها" },
              ]}
            />

            <div className="flex w-full overflow-visible">
              <div className="grow min-w-0">
                <article className="lg:mt-4 px-5 lg:px-0 pb-5 lg:border-b-[4px] lg:border-b-[var(--color-neutral-100)]">
                  <div id="PdpShortReview" className="scroll-mt-24">
                    <div className="break-words py-3">
                      <div className="flex items-center grow">
                        <h2 className="grow text-h5">
                          <span className="relative font-semibold">معرفی</span>
                        </h2>
                      </div>
                      <div className="mt-2 w-[4rem] h-[.1rem] bg-[var(--color-primary-700)]" />
                    </div>
                  </div>

                  <PdpDescriptionToggle
                    descriptionHtml={product.descriptionHtml}
                    maxWords={100}
                  />

                  <div className="flex content-between w-full overflow-x-scroll lg:overflow-x-hidden mt-4" />
                </article>

                <section className="lg:mt-4 px-5 lg:px-0 pb-5 lg:border-b-[4px] lg:border-b-[var(--color-neutral-100)]">
                  <div className="hidden lg:block">
                    <div className="break-words py-3 hidden lg:block">
                      <div className="flex items-center grow">
                        <h2 className="grow text-h5 text-neutral-900">
                          <span className="relative">مشخصات</span>
                        </h2>
                      </div>
                      <div className="mt-2 w-[4rem] h-[.1rem] bg-[var(--color-primary-700)]" />
                    </div>
                  </div>

                  <div className="mt-4 grow scroll-mt-24" id="specification">
                    <div className="flex flex-col lg:flex-row pb-6 lg:py-4 last:border-0">
                      <p className="w-full lg:ml-12 text-h5 text-neutral-700 shrink-0 mb-3 lg:mb-0 lg:w-[256px]">
                        مشخصات
                      </p>
                      <div className="w-full grow">
                        <PdpFeaturesToggle items={features} initialCount={5} />
                      </div>
                    </div>
                  </div>
                </section>

                <div id="commentSection" className="scroll-mt-24">
                  <section>
                    <div className="hidden" />
                    <div className="lg:mt-4 pb-3 w-screen lg:w-auto lg:border-b-[4px] lg:border-b-[var(--color-neutral-100)]">
                      <div>
                        <PdpCommentsSection
                          ratingAverage={product.ratingAverage ?? 0}
                          ratingCount={product.ratingCount ?? 0}
                          commentsCount={comments.length}
                          comments={comments}
                          submitSlot={
                            <SubmitReviewButton
                              productId={product.id}
                              productTitle={product.title}
                              productImageUrl={product.primaryImageUrl}
                            />
                          }
                        />
                      </div>
                    </div>
                  </section>
                </div>

                <div id="questionsSection" className="scroll-mt-24">
                  <ProductQuestionsSection
                    productId={product.id}
                    productTitle={product.title}
                    productImageUrl={product.primaryImageUrl}
                  />
                </div>
              </div>

              <div className="hidden 3xl:block mr-10">
                <div
                  className="sticky transition-[top] duration-200 ease-in-out"
                  style={{ top: "var(--pdp-sidebar-top)" }}
                >
                  <div
                    className="bg-neutral-100 mb-2 mt-2 p-4 rounded text-body-2 mt-5 w-[300px]
                               border border-neutral-200
                               bg-[linear-gradient(0deg,hsla(240,3%,94%,.5),hsla(240,3%,94%,.5)),#fff]"
                  >
                    <Suspense fallback={<ProductOffersSkeleton />}>
                      <ProductOffersPanelSticky
                        productId={product.id}
                        productSlug={slug}
                        productTitle={product.title}
                        productImageUrl={product.primaryImageUrl}
                      />
                    </Suspense>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}