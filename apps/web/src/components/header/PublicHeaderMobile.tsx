"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import { Search, Menu, MapPin } from "lucide-react";
import { CartDropdown } from "./CartDropdown";

type Props = {
    storeName?: string;
    logoUrl?: string | null;
};

export default function PublicHeaderMobile({ storeName, logoUrl }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const [q, setQ] = useState("");
    const headerRef = useRef<HTMLElement | null>(null);

    const hideHeader =
        pathname?.startsWith("/admin") || pathname === "/login" || pathname === "/register";

    useEffect(() => {
        const el = headerRef.current;
        if (!el) return;

        const set = () => {
            const h = Math.ceil(el.getBoundingClientRect().height);
            document.documentElement.style.setProperty("--public-header-h", `${h}px`);
        };

        set();
        const ro = new ResizeObserver(set);
        ro.observe(el);

        window.addEventListener("resize", set);
        window.addEventListener("load", set);

        return () => {
            ro.disconnect();
            window.removeEventListener("resize", set);
            window.removeEventListener("load", set);
        };
    }, []);

    const onSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const s = q.trim();
        router.push(s ? `/shop?q=${encodeURIComponent(s)}` : "/shop");
    };

    if (hideHeader) return null;

    return (
        <header
            data-site-header
            ref={headerRef}
            dir="rtl"
            className="sticky top-0 z-50 w-full bg-white border-b border-gray-200"
        >
            {/* Top bar */}
            <div className="h-14 px-3 flex items-center justify-between gap-2">
                <Link
                    href="/shop"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white"
                    aria-label="دسته‌بندی‌ها"
                    title="دسته‌بندی‌ها"
                >
                    <Menu className="w-5 h-5 text-gray-800" />
                </Link>

                <Link href="/" className="flex items-center gap-2 min-w-0">
                    {logoUrl ? (
                        <img
                            src={resolveMediaUrl(logoUrl)}
                            alt={storeName ?? "Logo"}
                            className="h-9 w-9 rounded-xl object-contain border border-gray-200 bg-white shrink-0"
                        />
                    ) : null}
                    <span className="text-sm font-extrabold text-gray-900 truncate">
                        {storeName ?? "فروشگاه"}
                    </span>
                </Link>

                <CartDropdown />
            </div>

            {/* Search */}
            <div className="px-3 pb-3">
                <form onSubmit={onSearch} className="relative">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="جستجو در محصولات…"
                        className="w-full h-11 rounded-xl bg-gray-100 border border-gray-200 pr-4 pl-11 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-gray-900/10 text-right"
                    />
                    <button
                        type="submit"
                        className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-200/60 transition"
                        aria-label="جستجو"
                        title="جستجو"
                    >
                        <Search className="w-5 h-5 text-gray-700" />
                    </button>
                </form>

                {/* Location shortcut */}
                <button
                    type="button"
                    className="mt-2 inline-flex items-center gap-2 text-xs text-gray-700"
                >
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-500 font-bold">انتخاب شهر</span>
                </button>
            </div>
        </header>
    );
}