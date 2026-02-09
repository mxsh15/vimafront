"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

type KV = { k: string; v: string };
type SimilarItem = { id: string; title: string; image: string; price: number; ship?: string | null };

type ProductVM = {
    id: string;
    slug: string;
    title: string;
    subtitleEn?: string | null;
    brandTitle?: string | null;
    images: string[];
    rating?: number | null; // 0..5
    commentsCount?: number | null;
    features: KV[];
    seller: {
        title: string;
        satisfactionPercent?: number | null;
        performanceLabel?: string | null;
        warranty?: string | null;
        stockLabel?: string | null;
        shippingLabel?: string | null;
    };
    pricing: {
        oldPrice?: number | null;
        price?: number | null;
        discountPercent?: number | null;
    };
    similar: SimilarItem[];
    specs: KV[];
};

function toman(n?: number | null) {
    if (!n || n <= 0) return "";
    return n.toLocaleString("fa-IR");
}

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

export default function ProductPageClient({ product }: { product: ProductVM }) {
    const [activeImage, setActiveImage] = useState(product.images?.[0] ?? "");
    const similarRef = useRef<HTMLDivElement | null>(null);

    const rating = clamp(Math.round(product.rating ?? 0), 0, 5);
    const stars = useMemo(() => Array.from({ length: 5 }, (_, i) => i < rating), [rating]);

    const discountPercent = product.pricing.discountPercent ?? 0;
    const oldPrice = product.pricing.oldPrice ?? null;
    const price = product.pricing.price ?? null;

    const scrollSimilar = (dir: "left" | "right") => {
        const el = similarRef.current;
        if (!el) return;
        const amount = dir === "left" ? -240 : 240;
        el.scrollBy({ left: amount, behavior: "smooth" });
    };

    return (
        <div className="bg-white text-sm text-[#3f4064]" dir="rtl" lang="fa">
            {/* Breadcrumbs */}
            <div className="mx-auto max-w-[1600px] px-4 py-4 text-xs text-[#81858b] flex gap-2">
                <Link href="#" className="hover:text-[#ef394e]">دیجی‌کالا</Link> /
                <Link href="#" className="hover:text-[#ef394e]">مد و پوشاک</Link> /
                <Link href="#" className="hover:text-[#ef394e]">ساعت</Link> /
                <Link href="#" className="hover:text-[#ef394e]">ساعت مچی</Link> /
                <span className="text-black">{product.title}</span>
            </div>

            <main className="mx-auto max-w-[1600px] px-4 pb-12">
                <div className="bg-white md:grid md:grid-cols-12 gap-8">
                    {/* Right Column: Gallery */}
                    <div className="md:col-span-4 lg:col-span-4 relative">
                        <div className="sticky top-24">
                            {/* Action Icons */}
                            <div className="absolute left-0 top-0 flex flex-col gap-4 z-10 text-gray-400">
                                <button className="hover:text-red-500" title="افزودن به علاقه‌مندی" type="button">
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

                            {/* Main Image */}
                            <div className="mb-4 flex justify-center py-8">
                                <div className="w-full max-w-[350px] aspect-[3/4] flex items-center justify-center">
                                    {activeImage ? (
                                        // اگر تصاویرت لوکال/آپلودی هست، دامنه یا next.config را تنظیم کن
                                        <Image
                                            src={activeImage}
                                            alt={product.title}
                                            width={700}
                                            height={900}
                                            className="object-contain w-full h-full mix-blend-multiply"
                                            priority
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-50 rounded-lg" />
                                    )}
                                </div>
                            </div>

                            {/* Thumbnails */}
                            <div className="flex gap-2 overflow-x-auto no-scrollbar justify-center">
                                {(product.images ?? []).slice(0, 3).map((img) => {
                                    const isActive = img === activeImage;
                                    return (
                                        <button
                                            key={img}
                                            type="button"
                                            onClick={() => setActiveImage(img)}
                                            className={[
                                                "border rounded-lg p-1 w-20 h-20 cursor-pointer hover:border-gray-400 overflow-hidden",
                                                isActive ? "border-gray-300" : "opacity-70",
                                            ].join(" ")}
                                            title="تصویر"
                                        >
                                            <Image src={img} alt="" width={160} height={160} className="w-full h-full object-cover" />
                                        </button>
                                    );
                                })}

                                {product.images.length > 3 && (
                                    <div className="border rounded-lg p-1 w-20 h-20 flex items-center justify-center bg-gray-50 text-gray-400">
                                        <span className="text-2xl">...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Center Column: Info */}
                    <div className="md:col-span-5 lg:col-span-5 pt-4">
                        <nav className="text-sky-500 text-sm mb-2 font-bold">
                            برند: {product.brandTitle ?? "—"}
                        </nav>

                        <h1 className="text-xl font-bold leading-8 mb-2 text-gray-800">
                            {product.title}
                        </h1>

                        {product.subtitleEn ? (
                            <h2 className="text-gray-400 text-sm mb-4 border-b pb-4" style={{ direction: "ltr", textAlign: "right" }}>
                                {product.subtitleEn}
                            </h2>
                        ) : (
                            <div className="border-b pb-4 mb-4" />
                        )}

                        <div className="flex items-center gap-2 mb-6 text-sm">
                            <div className="flex items-center text-yellow-400">
                                {stars.map((on, i) => (
                                    <span key={i} className={on ? "" : "text-gray-300"}>★</span>
                                ))}
                            </div>

                            <span className="text-gray-400">
                                ({(product.commentsCount ?? 0) === 0 ? "بدون دیدگاه" : `${product.commentsCount} دیدگاه`})
                            </span>

                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <Link href="#comments" className="text-sky-500">ارسال دیدگاه</Link>
                        </div>

                        <div className="mb-6">
                            <div className="font-bold text-base mb-3">ویژگی‌ها</div>
                            <ul className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600">
                                {product.features.map((f) => (
                                    <li key={f.k} className="flex items-start gap-2">
                                        <span className="text-gray-400">•</span>
                                        <span>
                                            <span className="text-gray-400">{f.k}:</span> {f.v}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex items-center justify-between text-gray-500 text-sm mb-2">
                                <span>بیمه</span>
                                <Link href="#" className="text-sky-500 flex items-center">
                                    جزئیات
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Link>
                            </div>

                            <div className="border rounded-lg p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#ef394e] focus:ring-[#ef394e]" />
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-700">بیمه تجهیزات دیجیتال</span>
                                        <span className="text-xs text-gray-400">تامین اجتماعی (یک ساله)</span>
                                    </div>
                                </div>
                                <div className="text-sm font-bold">۹۹,۰۰۰ تومان</div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-gray-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            </svg>
                            <span>
                                امکان برگشت کالا در گروه ساعت عقربه ای با دلیل "انصراف از خرید" تنها در صورتی مورد قبول است که پلمپ کالا باز نشده باشد.
                            </span>
                        </div>
                    </div>

                    {/* Left Column: Buy Box */}
                    <div className="md:col-span-3 lg:col-span-3">
                        <div className="bg-[#f0f0f1]/30 border border-gray-200 rounded-lg p-4 sticky top-28">
                            <div className="mb-4">
                                <div className="font-bold text-lg mb-4 text-black">فروشنده</div>

                                <div className="flex items-start gap-3 mb-4">
                                    <div className="mt-1">
                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>

                                    <div>
                                        <div className="font-bold text-gray-700">{product.seller.title}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {typeof product.seller.satisfactionPercent === "number" && (
                                                <>
                                                    <span className="text-green-600">{toman(product.seller.satisfactionPercent)}٪</span>{" "}
                                                    رضایت از کالا | عملکرد{" "}
                                                </>
                                            )}
                                            {product.seller.performanceLabel ? (
                                                <span className="text-green-600">{product.seller.performanceLabel}</span>
                                            ) : (
                                                "—"
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t my-3" />

                                <div className="flex items-center gap-3 mb-3 text-sm">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <span className="font-medium text-gray-700">{product.seller.warranty ?? "—"}</span>
                                </div>

                                <div className="border-t my-3" />

                                <div className="flex items-center gap-3 mb-3 text-sm">
                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="font-medium text-gray-700">{product.seller.stockLabel ?? "—"}</span>
                                </div>

                                <div className="flex items-center gap-3 mb-3 text-xs text-gray-500 pr-8">
                                    <span className="text-[#ef394e]">ارسال دیجی‌کالا</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                    <span>{product.seller.shippingLabel ?? "—"}</span>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                {oldPrice ? (
                                    <div className="text-left text-xs text-gray-400 mb-1 line-through">{toman(oldPrice)}</div>
                                ) : (
                                    <div className="h-4 mb-1" />
                                )}

                                <div className="flex justify-end items-center gap-2 mb-2">
                                    {discountPercent > 0 && (
                                        <div className="bg-[#ef394e] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                            {toman(discountPercent)}٪
                                        </div>
                                    )}

                                    <div className="text-xl font-bold text-gray-800">
                                        {price ? (
                                            <>
                                                {toman(price)} <span className="text-xs font-normal text-gray-500">تومان</span>
                                            </>
                                        ) : (
                                            <span className="text-sm font-bold text-gray-700">تماس بگیرید</span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    className="w-full bg-[#ef394e] hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-md disabled:opacity-50"
                                    disabled={!price}
                                    type="button"
                                >
                                    افزودن به سبد خرید
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar Products Carousel */}
                <section className="mt-12 border rounded-xl p-4 mb-8">
                    <h3 className="text-lg font-bold mb-6 pr-2 border-r-4 border-[#ef394e]">کالاهای مشابه</h3>

                    <div className="relative group">
                        <div ref={similarRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-4" id="similarScroll">
                            {product.similar.map((p) => (
                                <div
                                    key={p.id}
                                    className="min-w-[180px] md:min-w-[220px] border border-gray-100 rounded-lg p-3 hover:shadow-[0_1px_2px_0_rgba(0,0,0,.15)] transition bg-white flex flex-col"
                                >
                                    <Image src={p.image} alt={p.title} width={440} height={320} className="w-full h-40 object-contain mb-4 mix-blend-multiply" />
                                    <h4 className="text-xs font-bold text-gray-600 line-clamp-2 mb-2">{p.title}</h4>

                                    <div className="mt-auto">
                                        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                                            <span>{p.ship ?? ""}</span>
                                        </div>

                                        <div className="flex justify-end gap-1 items-center">
                                            <span className="font-bold text-gray-700">{toman(p.price)}</span>
                                            <span className="text-[10px]">تومان</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Nav buttons (md+) */}
                        <button
                            className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white border shadow-md rounded-full p-2 text-gray-500 hover:text-black hidden md:block"
                            onClick={() => scrollSimilar("left")}
                            type="button"
                            aria-label="قبلی"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <button
                            className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white border shadow-md rounded-full p-2 text-gray-500 hover:text-black hidden md:block"
                            onClick={() => scrollSimilar("right")}
                            type="button"
                            aria-label="بعدی"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </section>

                {/* Tabs (visual) */}
                <div className="border-b mb-6 sticky top-[72px] bg-white z-20">
                    <div className="flex gap-8 text-sm font-bold text-gray-500 overflow-x-auto no-scrollbar">
                        <a href="#specs" className="text-[#ef394e] border-b-2 border-[#ef394e] pb-3 whitespace-nowrap">مشخصات</a>
                        <a href="#comments" className="hover:text-[#3f4064] pb-3 whitespace-nowrap">دیدگاه‌ها</a>
                        <a href="#qa" className="hover:text-[#3f4064] pb-3 whitespace-nowrap">پرسش و پاسخ</a>
                    </div>
                </div>

                {/* Specifications */}
                <div id="specs" className="grid md:grid-cols-12 gap-8 mb-12">
                    <div className="md:col-span-3">
                        <h4 className="font-bold text-lg mb-2">مشخصات</h4>
                    </div>

                    <div className="md:col-span-9">
                        <div className="mb-6">
                            <h5 className="font-bold text-gray-700 mb-4 border-l-4 border-[#ef394e] pl-2">مشخصات کلی</h5>

                            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                {product.specs.map((it, idx) => (
                                    <div key={it.k}>
                                        <div className="flex">
                                            <div className="w-1/3 text-gray-400">{it.k}</div>
                                            <div className="w-2/3 text-gray-700 font-medium">{it.v}</div>
                                        </div>
                                        {idx !== product.specs.length - 1 && <div className="border-t border-gray-200 mt-4" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="text-sky-500 cursor-pointer text-sm font-bold flex items-center gap-1">
                            مشاهده بیشتر
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Comments placeholder */}
                <div id="comments" className="grid md:grid-cols-12 gap-8 mb-12 border-t pt-8">
                    <div className="md:col-span-3">
                        <h4 className="font-bold text-lg mb-2">امتیاز و دیدگاه کاربران</h4>
                        <div className="text-xs text-gray-500 mb-4">در مورد این کالا نظر دهید</div>
                        <button className="w-full border border-[#ef394e] text-[#ef394e] hover:bg-red-50 font-bold py-2 rounded-lg transition" type="button">
                            ثبت دیدگاه
                        </button>
                    </div>

                    <div className="md:col-span-9">
                        <div className="flex flex-col items-center justify-center h-32 text-gray-400 bg-gray-50 rounded-lg border border-dashed">
                            <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            <span>هنوز دیدگاهی ثبت نشده است</span>
                        </div>
                    </div>
                </div>

                <div id="qa" className="hidden" />
            </main>
        </div>
    );
}
