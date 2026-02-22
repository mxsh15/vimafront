import Link from "next/link";

export default function PublicFooterMobile() {
    return (
        <footer className="mt-10 bg-white border-t border-gray-200">
            <div className="px-3 py-6">
                <div className="text-sm font-extrabold text-gray-900">فروشگاه آنلاین ویما</div>
                <p className="mt-2 text-xs text-gray-600 leading-6">
                    نسخه موبایل فوتر: کوتاه، کاربردی، بدون دیوار متن.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <Link className="text-gray-700 hover:text-gray-900" href="/faq">سوالات متداول</Link>
                    <Link className="text-gray-700 hover:text-gray-900" href="/contact">تماس با ما</Link>
                    <Link className="text-gray-700 hover:text-gray-900" href="/terms">قوانین</Link>
                    <Link className="text-gray-700 hover:text-gray-900" href="/privacy">حریم خصوصی</Link>
                </div>

                <div className="mt-6 text-[11px] text-gray-500">
                    © 1404 شاپ ویما. همه حقوق محفوظ است.
                </div>
            </div>
        </footer>
    );
}