import type { PdpComment } from "./PdpCommentsList";
import ProductGallery from "./ProductGallery";
import ProductQuestionsSection from "./ProductQuestionsSection";
import PdpCommentsSection from "./PdpCommentsSection";
import ProductOffersPanelSticky from "./ProductOffersPanelSticky";

function toFaNumber(n: number) {
    return Number(n || 0).toLocaleString("fa-IR");
}

export default function ProductMobileView(props: {
    product: any;
    comments: PdpComment[];
    ratingAverageText: string;
    buyersCountText: string;
    commentsCountText: string;
}) {
    const { product, comments, ratingAverageText, buyersCountText, commentsCountText } = props;

    const specs = product.specs ?? [];
    const features = (product.features?.length ? product.features : specs) ?? [];

    return (
        <div className="bg-white text-neutral-900" dir="rtl" lang="fa">
            {/* موبایل: هدر جمع و جور */}
            <header className="sticky top-0 z-40 bg-white border-b border-neutral-100">
                <div className="px-4 py-3 flex items-center justify-between">
                    <a href="/" className="text-body2-strong text-neutral-800">ویماشاپ</a>
                    <div className="text-body-2 text-neutral-500">صفحه محصول</div>
                </div>
            </header>

            {/* گالری موبایل: تمام‌عرض */}
            <div className="px-4 pt-4">
                <ProductGallery
                    title={product.title}
                    primaryImageUrl={product.primaryImageUrl}
                    galleryImageUrls={product.galleryImageUrls ?? []}
                />
            </div>

            {/* عنوان و خلاصه امتیاز */}
            <section className="px-4 pt-4">
                <div className="text-body-2 text-secondary-500">
                    {product.brandTitle ?? "برند نامشخص"}
                </div>

                <h1 className="mt-1 text-h4 text-neutral-900 leading-8">
                    {product.title}
                </h1>

                <div className="mt-3 flex items-center gap-3 text-body-2 text-neutral-600">
                    <span className="text-neutral-900 text-body2-strong">{ratingAverageText}</span>
                    <span>از {buyersCountText} خریدار</span>
                    <span className="text-neutral-300">|</span>
                    <span>{commentsCountText} دیدگاه</span>
                </div>
            </section>


            <section className="px-4 mt-4">
                <div className="rounded-2xl border border-neutral-100 bg-white">
                    <div className="px-4 py-3 border-b border-neutral-100 text-body1-strong text-neutral-800">
                        مشخصات کلیدی
                    </div>

                    <div className="divide-y divide-neutral-100">
                        {(features ?? []).slice(0, 8).map((it: any, idx: number) => (
                            <div key={idx} className="px-4 py-3 flex items-start justify-between gap-4">
                                <div className="text-body-2 text-neutral-500 shrink-0 min-w-[120px]">
                                    {String(it?.title ?? it?.name ?? it?.key ?? "ویژگی")}
                                </div>
                                <div className="text-body-2 text-neutral-800 text-left">
                                    {String(it?.value ?? it?.text ?? it?.displayValue ?? it?.val ?? "-")}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-4 mt-6" id="commentSection">
                <PdpCommentsSection productId={product.id} comments={comments} />
            </section>

            <section className="px-4 mt-6" id="questionsSection">
                <ProductQuestionsSection productId={product.id} productSlug={product.slug} />
            </section>

            <div className="h-24" />


            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-100">
                <div className="mx-auto max-w-main px-4 py-3">
                    <ProductOffersPanelSticky
                        productId={product.id}
                        productSlug={product.slug}
                        productTitle={product.title}
                        productImageUrl={product.primaryImageUrl}
                    />
                </div>
            </div>
        </div>
    );
}