"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/context/PermissionContext";
import { usePathname, useRouter } from "next/navigation";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import {
  Search,
  ShoppingCart,
  Bell,
  MapPin,
  Menu,
  Sparkles,
  Store,
  Gem,
  Flame,
  HelpCircle,
  LogIn,
} from "lucide-react";
import { MegaMenuOverlay } from "./MegaMenuOverlay";
import { listPublicCategoryOptions } from "@/modules/category/api";
import { CategoryOptionDto } from "@/modules/category/types";
import { CartDropdown } from "./CartDropdown";

export type MegaCategory = {
  id: string;
  title: string;
  href?: string;
  groups: { title: string; items: { title: string; href: string }[] }[];
};

type Props = {
  storeName?: string;
  logoUrl?: string | null;
  cartCount?: number;
  initialCategoryOptions: CategoryOptionDto[];
};

function buildMegaFromCategoryOptions(opts: CategoryOptionDto[]): MegaCategory[] {
  const childrenByParent = new Map<string | null, CategoryOptionDto[]>();
  const normParent = (p?: string | null) => (p ? String(p) : null);

  for (const c of opts ?? []) {
    const key = normParent(c.parentId ?? null);
    const arr = childrenByParent.get(key) ?? [];
    arr.push(c);
    childrenByParent.set(key, arr);
  }

  const roots = childrenByParent.get(null) ?? [];
  const toHref = (id: string) => `/shop?categoryId=${encodeURIComponent(id)}`;

  return roots.map((root) => {
    const level2 = childrenByParent.get(String(root.id)) ?? [];
    const groups = level2.map((l2) => {
      const level3 = childrenByParent.get(String(l2.id)) ?? [];
      const items =
        level3.length > 0
          ? [
            { title: `همه ${l2.title}`, href: toHref(String(l2.id)) },
            ...level3.map((l3) => ({
              title: l3.title,
              href: toHref(String(l3.id)),
            })),
          ]
          : [{ title: l2.title, href: toHref(String(l2.id)) }];

      return {
        title: l2.title,
        items,
      };
    });

    return {
      id: String(root.id),
      title: root.title,
      href: toHref(String(root.id)),
      groups,
    };
  });
}

export default function PublicHeader({ storeName, logoUrl, cartCount, initialCategoryOptions }: Props) {
  const { isAuthenticated, user, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const canAccessAdmin =
    user?.role === "Admin" ||
    (isAuthenticated &&
      (hasPermission("users.view") ||
        hasPermission("roles.view") ||
        hasPermission("permissions.view") ||
        hasPermission("vendors.view") ||
        hasPermission("brands.view") ||
        hasPermission("categories.view") ||
        hasPermission("tags.view") ||
        hasPermission("products.view") ||
        hasPermission("media.view") ||
        hasPermission("specAttributes.view") ||
        hasPermission("specGroups.view")));

  const topLinks = useMemo(
    () => [
      { title: "شگفت‌انگیزها", href: "/shop", Icon: Sparkles },
      { title: "سوپرمارکت", href: "/shop", Icon: Store },
      { title: "طلای دیجیتال", href: "/shop", Icon: Gem },
      { title: "پرفروش‌ترین‌ها", href: "/shop", Icon: Flame },
      { title: "سوالی دارید؟", href: "/faq", Icon: HelpCircle },
    ],
    []
  );

  // --- Mega menu data (REAL, from API)
  const initialMega = useMemo(
    () => buildMegaFromCategoryOptions(initialCategoryOptions ?? []),
    [initialCategoryOptions]
  );
  const [megaData, setMegaData] = useState<MegaCategory[]>(initialMega);
  const [megaLoading, setMegaLoading] = useState<boolean>(false);

  // --- Mega menu state
  const [megaOpen, setMegaOpen] = useState(false);
  const [activeMegaId, setActiveMegaId] = useState<string>("");
  const catBtnRef = useRef<HTMLButtonElement | null>(null);

  // ✅ این یکی برای "بعد از header" (backdropTop)
  const headerRef = useRef<HTMLElement | null>(null);

  // ✅ این یکی برای "هم‌عرض شدن پنل" (width/left)
  const headerContainerRef = useRef<HTMLDivElement | null>(null);

  // close delay timer
  const hoverCloseTimer = useRef<number | null>(null);

  const openMega = () => {
    if (scrollingRef.current) return;
    if (hoverCloseTimer.current) {
      window.clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
    if (megaData.length > 0) setMegaOpen(true);
  };

  const scheduleCloseMega = () => {
    if (hoverCloseTimer.current) window.clearTimeout(hoverCloseTimer.current);
    hoverCloseTimer.current = window.setTimeout(() => setMegaOpen(false), 120);
  };

  const closeMegaImmediate = () => {
    if (hoverCloseTimer.current) {
      window.clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
    setMegaOpen(false);
  };

  const hideHeader =
    pathname?.startsWith("/admin") || pathname === "/login" || pathname === "/register";

  useEffect(() => {
    return () => {
      if (hoverCloseTimer.current) window.clearTimeout(hoverCloseTimer.current);
    };
  }, []);

  // Row2 hide on scroll
  const [showRow2, setShowRow2] = useState(true);
  const megaOpenRef = useRef(false);

  const scrollingRef = useRef(false);
  const scrollEndTimer = useRef<number | null>(null);

  useEffect(() => {
    megaOpenRef.current = megaOpen;
  }, [megaOpen]);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      scrollingRef.current = true;
      if (scrollEndTimer.current) window.clearTimeout(scrollEndTimer.current);
      scrollEndTimer.current = window.setTimeout(() => {
        scrollingRef.current = false;
      }, 150);

      if (megaOpenRef.current) closeMegaImmediate();

      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;
        const now = performance.now();

        // ✅ cooldown: جلوی رفت و برگشت را می‌گیرد
        if (now < lockUntilRef.current && delta > 0) {
          lastY = y;
          ticking = false;
          return;
        }

        // ✅ فقط وقتی واقعاً لازم است تغییر بده
        if (delta > 6) {
          // scroll down
          if (y > HIDE_AT && showRow2Ref.current) {
            setShowRow2(false);
            lockUntilRef.current = now + TOGGLE_COOLDOWN_MS;
          }
        } else if (delta < -6) {
          // scroll up
          if (!showRow2Ref.current) {
            setShowRow2(true);
            lockUntilRef.current = 0;
          }
        }

        lastY = y;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const s = q.trim();
    router.push(s ? `/shop?q=${encodeURIComponent(s)}` : "/shop");
  };

  const megaReady = !megaLoading && megaData.length > 0;

  const showRow2Ref = useRef(true);
  useEffect(() => {
    showRow2Ref.current = showRow2;
  }, [showRow2]);

  const lockUntilRef = useRef(0);
  const HIDE_AT = 180;
  const SHOW_AT = 120;
  const TOGGLE_COOLDOWN_MS = 220;

  useEffect(() => {
    setActiveMegaId((prev) => prev || initialMega[0]?.id || "");
  }, [initialMega]);

  if (hideHeader) return null;

  return (
    <header
      ref={headerRef}
      dir="rtl"
      className="sticky top-0 z-50 w-full bg-white border-b border-gray-200"
    >
      <div ref={headerContainerRef} className="w-full px-2 sm:px-3 lg:px-4">
        {/* Row 1 */}
        <div className="h-16 flex items-center gap-3">
          {/* Right: Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {logoUrl ? (
              <img
                src={resolveMediaUrl(logoUrl)}
                alt={storeName ?? "Logo"}
                className="h-10 w-10 rounded-xl object-contain border border-gray-200 bg-white"
              />
            ) : null}

            <span className="text-2xl font-medium tracking-[0.55em] text-gray-900 select-none">
              {storeName ?? "Logo"}
            </span>
          </Link>

          {/* Center: Search */}
          <form onSubmit={onSearch} className="flex-1">
            <div className="relative w-full">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="جستجو"
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
            </div>
          </form>

          {/* Left: actions */}
          <div className="flex items-center gap-2 shrink-0">
            <CartDropdown />

            {isAuthenticated ? (
              <button
                onClick={() => logout()}
                className="inline-flex items-center justify-center h-10 px-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition text-sm font-semibold text-gray-800"
              >
                خروج
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 justify-center h-10 px-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition text-sm font-semibold text-gray-800"
              >
                <LogIn className="w-4 h-4" />
                ورود | ثبت‌نام
              </Link>
            )}

            <button
              type="button"
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition"
              aria-label="اعلان‌ها"
              title="اعلان‌ها"
            >
              <Bell className="w-5 h-5 text-gray-800" />
            </button>
          </div>
        </div>

        {/* Row 2 (animated height) */}
        <div
          className={[
            "border-t border-gray-100 overflow-hidden",
            showRow2 ? "h-14" : "h-0",
          ].join(" ")}
        >
          <div
            className={[
              "h-14",
              "transition-[transform,opacity] duration-200 will-change-transform",
              showRow2
                ? "translate-y-0 opacity-100 pointer-events-auto"
                : "-translate-y-full opacity-0 pointer-events-none",
            ].join(" ")}
          >
            <div className="h-11 flex items-center justify-between gap-2 overflow-visible">
              {/* Right: category + links */}
              <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible">
                <div className="relative">
                  <button
                    ref={catBtnRef}
                    type="button"
                    onMouseEnter={openMega}
                    onMouseLeave={scheduleCloseMega}
                    onFocus={openMega}
                    onClick={() => {
                      if (!megaReady) return;
                      setMegaOpen((v) => !v);
                    }}
                    className={[
                      "inline-flex items-center gap-2 whitespace-nowrap text-sm font-bold",
                      megaReady
                        ? "text-gray-900 hover:text-rose-600 cursor-pointer"
                        : "text-gray-400 cursor-not-allowed",
                    ].join(" ")}
                    aria-haspopup="menu"
                    aria-expanded={megaOpen}
                    title={megaReady ? "دسته‌بندی کالاها" : "دسته‌بندی‌ها هنوز لود نشده"}
                  >
                    <Menu className="w-5 h-5" />
                    دسته‌بندی کالاها
                  </button>
                </div>

                <span className="h-5 w-px bg-gray-200" />

                <nav className="flex items-center gap-3 whitespace-nowrap text-sm text-gray-700">
                  {topLinks.map(({ title, href, Icon }) => (
                    <Link
                      key={title}
                      href={href}
                      className="inline-flex items-center gap-1.5 hover:text-gray-900 transition"
                    >
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span>{title}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Left: location */}
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition shrink-0"
              >
                <MapPin className="w-4 h-4 text-orange-500" />
                <span className="text-orange-500 font-medium">شهر خود را انتخاب کنید</span>
              </button>
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden pb-2">
            <div className="flex items-center justify-between gap-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-bold text-gray-900"
              >
                <Menu className="w-5 h-5" />
                دسته‌بندی کالاها
              </Link>

              <button type="button" className="inline-flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span className="text-orange-500 font-medium">انتخاب شهر</span>
              </button>
            </div>

            {isAuthenticated && canAccessAdmin ? (
              <div className="pt-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center h-9 px-3 rounded-xl bg-gray-900 text-white text-xs font-bold"
                >
                  پنل مدیریت
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <MegaMenuOverlay
        open={megaOpen}
        anchorRef={catBtnRef}
        containerRef={headerContainerRef}
        headerRef={headerRef}
        onClose={closeMegaImmediate}
        onRequestOpen={openMega}
        onRequestClose={scheduleCloseMega}
        offset={16}
        mega={megaData}
        activeId={activeMegaId}
        setActiveId={setActiveMegaId}
      />
    </header>
  );
}
