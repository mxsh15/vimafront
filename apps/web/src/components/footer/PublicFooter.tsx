import Link from "next/link";
import {
    Truck,
    RotateCcw,
    Headphones,
    ShieldCheck,
    CreditCard,
    Instagram,
    Twitter,
    Send,
    Smartphone,
} from "lucide-react";
import NewsletterSignup from "./NewsletterSignup";

const footerLinks = [
    {
        title: "با فروشگاه",
        items: [
            { label: "اتاق خبر", href: "/blog" },
            { label: "فروش در فروشگاه", href: "/sell" },
            { label: "فرصت‌های شغلی", href: "/careers" },
            { label: "تماس با ما", href: "/contact" },
            { label: "درباره ما", href: "/about" },
        ],
    },
    {
        title: "خدمات مشتریان",
        items: [
            { label: "پاسخ به پرسش‌های متداول", href: "/faq" },
            { label: "رویه‌های بازگرداندن کالا", href: "/returns" },
            { label: "شرایط استفاده", href: "/terms" },
            { label: "حریم خصوصی", href: "/privacy" },
            { label: "گزارش باگ / شکایت", href: "/support" },
        ],
    },
    {
        title: "راهنمای خرید",
        items: [
            { label: "راهنمای ثبت سفارش", href: "/guide/order" },
            { label: "رویه ارسال سفارش", href: "/guide/shipping" },
            { label: "شیوه‌های پرداخت", href: "/guide/payment" },
            { label: "پیگیری سفارش", href: "/orders" },
        ],
    },
];

function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="text-sm text-gray-600 hover:text-gray-900 transition leading-7"
        >
            {children}
        </Link>
    );
}

export default function PublicFooter() {
    return (
        <footer className="mt-10 bg-white border-t border-gray-200">
            {/* Top perks */}
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                            <Truck className="w-5 h-5 text-gray-900" />
                        </div>
                        <div>
                            <div className="text-sm font-extrabold text-gray-900">ارسال سریع</div>
                            <div className="text-xs text-gray-600">تحویل در کوتاه‌ترین زمان</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                            <RotateCcw className="w-5 h-5 text-gray-900" />
                        </div>
                        <div>
                            <div className="text-sm font-extrabold text-gray-900">مرجوعی آسان</div>
                            <div className="text-xs text-gray-600">تا چند روز بعد خرید</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-gray-900" />
                        </div>
                        <div>
                            <div className="text-sm font-extrabold text-gray-900">ضمانت اصالت</div>
                            <div className="text-xs text-gray-600">کالاهای معتبر و رسمی</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-gray-900" />
                        </div>
                        <div>
                            <div className="text-sm font-extrabold text-gray-900">پرداخت امن</div>
                            <div className="text-xs text-gray-600">درگاه مطمئن و امن</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                            <Headphones className="w-5 h-5 text-gray-900" />
                        </div>
                        <div>
                            <div className="text-sm font-extrabold text-gray-900">پشتیبانی</div>
                            <div className="text-xs text-gray-600">همراه شما در خرید</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main footer */}
            <div className="container mx-auto px-3 sm:px-4 lg:px-6">
                <div className="border-t border-gray-100 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Link columns */}
                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {footerLinks.map((col) => (
                            <div key={col.title}>
                                <div className="text-sm font-extrabold text-gray-900">{col.title}</div>
                                <div className="mt-3 space-y-1.5">
                                    {col.items.map((x) => (
                                        <div key={x.label}>
                                            <TextLink href={x.href}>{x.label}</TextLink>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Newsletter + social */}
                    <NewsletterSignup />
                </div>

                {/* Description + trust badges */}
                <div className="border-t border-gray-100 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8">
                        <div className="text-sm font-extrabold text-gray-900">فروشگاه آنلاین ویما</div>
                        <p className="mt-2 text-sm text-gray-600 leading-7">
                            اینجا جای متن معرفی کوتاه فروشگاه است. یک پاراگراف واقعی و مختصر که
                            بعدا می‌تونی از تنظیمات سایت یا CMS بخونی. هدفش اعتمادسازی است، نه شعر.
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <TextLink href="/terms">قوانین و مقررات</TextLink>
                            <span className="text-gray-300">|</span>
                            <TextLink href="/privacy">حریم خصوصی</TextLink>
                            <span className="text-gray-300">|</span>
                            <TextLink href="/returns">بازگشت کالا</TextLink>
                        </div>
                    </div>

                    <div className="lg:col-span-4">
                        <div className="grid grid-cols-3 gap-2">
                            {["نماد ۱", "نماد ۲", "نماد ۳"].map((t) => (
                                <div
                                    key={t}
                                    className="rounded-2xl border border-gray-200 bg-white p-3 flex flex-col items-center justify-center"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200" />
                                    <div className="mt-2 text-[11px] font-bold text-gray-700">{t}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 text-xs text-gray-500 leading-6">
                            جای لوگوهای اعتماد/اینماد/پرداخت و... (واقعی) اینجاست.
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-gray-200 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="text-xs text-gray-500">
                        © 1404 شاپ ویما. همه حقوق محفوظ است.
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="#"
                            className="text-xs font-bold text-gray-700 hover:text-gray-900 transition"
                        >
                            همکاری با ما
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link
                            href="#"
                            className="text-xs font-bold text-gray-700 hover:text-gray-900 transition"
                        >
                            گزارش تخلف
                        </Link>
                    </div>
                </div>

                {/* Partner logos strip */}
                <div className="pb-8">
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-12 rounded-2xl bg-white border border-gray-200"
                                    aria-label={`partner-${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
