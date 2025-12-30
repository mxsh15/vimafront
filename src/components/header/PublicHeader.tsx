"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/context/PermissionContext";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { resolveMediaUrl } from "@/modules/media/resolve-url";

type Props = {
  storeName?: string;
  logoUrl?: string | null;
};

export default function PublicHeader({ storeName, logoUrl }: Props) {
  const { isAuthenticated, user, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const pathname = usePathname();


  const canAccessAdmin = user?.role === "Admin" ||
    (isAuthenticated && (
      hasPermission("users.view") ||
      hasPermission("roles.view") ||
      hasPermission("permissions.view") ||
      hasPermission("vendors.view") ||
      hasPermission("brands.view") ||
      hasPermission("categories.view") ||
      hasPermission("tags.view") ||
      hasPermission("products.view") ||
      hasPermission("media.view") ||
      hasPermission("specAttributes.view") ||
      hasPermission("specGroups.view")
    ));

  const handleLogout = () => {
    logout();
  };

  if (pathname?.startsWith("/admin") || pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {logoUrl ? (
              <img
                src={resolveMediaUrl(logoUrl)}
                alt={storeName ?? "Logo"}
                className="h-8 w-8 rounded object-contain"
              />
            ) : null}

            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {storeName ?? "VimaShop"}
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              صفحه اصلی
            </Link>
            <Link
              href="/cart"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              سبد خرید
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* نمایش لینک پنل مدیریت فقط برای کاربران با دسترسی */}
                {canAccessAdmin && (
                  <Link
                    href="/admin"
                    className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    پنل مدیریت
                  </Link>
                )}

                {/* User Menu */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.fullName || user?.firstName || "کاربر"}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                  >
                    خروج
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  ورود
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  ثبت‌نام
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

