"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePermissions } from "@/context/PermissionContext";
import { useAuth } from "@/context/AuthContext";
import { getRouteViewPermission, routeRequiresPermission } from "@/lib/routePermissions";

interface RouteGuardProps {
  children: React.ReactNode;
}

/**
 * Component برای محافظت از route ها بر اساس permissions
 * اگر کاربر دسترسی نداشته باشد، به صفحه 403 یا داشبورد redirect می‌شود
 */
export function RouteGuard({ children }: RouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const loading = permissionsLoading || authLoading;

  useEffect(() => {
    // اگر هنوز در حال لود شدن است، صبر کن
    if (loading) return;

    // چک کردن احراز هویت - اگر کاربر لاگین نکرده باشد، به صفحه لاگین redirect کن
    if (!isAuthenticated || !user) {
      console.warn(`Unauthorized access to ${pathname}. Redirecting to login.`);
      router.push("/login");
      return;
    }

    // چک کردن دسترسی به صفحه اصلی پنل مدیریت (/admin)
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      // اگر کاربر Admin است، اجازه دسترسی بده
      if (user.role === "Admin") {
        return;
      }

      // چک کردن آیا کاربر حداقل یکی از دسترسی‌های view را دارد
      const hasAnyViewPermission = 
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
        hasPermission("specGroups.view");

      // اگر کاربر هیچ دسترسی view ندارد، به صفحه اصلی redirect کن
      if (!hasAnyViewPermission) {
        console.warn(`Access denied to admin panel. User has no view permissions.`);
        router.push("/");
        return;
      }
    }

    // چک کردن آیا این route نیاز به permission دارد
    if (!routeRequiresPermission(pathname)) {
      // این route نیاز به permission ندارد، اجازه دسترسی بده
      return;
    }

    // اگر کاربر Admin است، اجازه دسترسی بده
    if (user.role === "Admin") {
      return;
    }

    // گرفتن permission مورد نیاز
    const requiredPermission = getRouteViewPermission(pathname);

    if (requiredPermission && !hasPermission(requiredPermission)) {
      // کاربر دسترسی ندارد، redirect به داشبورد
      console.warn(`Access denied to ${pathname}. Required permission: ${requiredPermission}`);
      router.push("/admin");
    }
  }, [pathname, hasPermission, loading, router, user, isAuthenticated]);

  // اگر در حال لود شدن است، چیزی نمایش نده
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-sm text-gray-500">در حال بررسی دسترسی‌ها...</div>
        </div>
      </div>
    );
  }

  // چک کردن احراز هویت
  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-sm text-gray-500">در حال هدایت به صفحه ورود...</div>
        </div>
      </div>
    );
  }

  // چک کردن دسترسی به صفحه اصلی پنل مدیریت
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    // اگر کاربر Admin است، اجازه دسترسی بده
    if (user.role === "Admin") {
      // ادامه بررسی برای sub-routes
    } else {
      // چک کردن آیا کاربر حداقل یکی از دسترسی‌های view را دارد
      const hasAnyViewPermission = 
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
        hasPermission("specGroups.view");

      // اگر کاربر هیچ دسترسی view ندارد، صفحه عدم دسترسی نمایش بده
      if (!hasAnyViewPermission) {
        return (
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <h1 className="mb-2 text-2xl font-bold text-gray-900">دسترسی محدود</h1>
              <p className="mb-4 text-gray-600">
                شما دسترسی لازم برای ورود به پنل مدیریت را ندارید.
              </p>
              <button
                onClick={() => router.push("/")}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                بازگشت به صفحه اصلی
              </button>
            </div>
          </div>
        );
      }
    }
  }

  // چک کردن دسترسی
  if (routeRequiresPermission(pathname)) {
    // اگر کاربر Admin است، اجازه دسترسی بده
    if (user.role === "Admin") {
      return <>{children}</>;
    }

    const requiredPermission = getRouteViewPermission(pathname);
    if (requiredPermission && !hasPermission(requiredPermission)) {
      // نمایش صفحه عدم دسترسی
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">دسترسی محدود</h1>
            <p className="mb-4 text-gray-600">
              شما دسترسی لازم برای مشاهده این صفحه را ندارید.
            </p>
            <button
              onClick={() => router.push("/admin")}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              بازگشت به داشبورد
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

