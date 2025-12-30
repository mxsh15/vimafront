"use client";
import AdminShell from "@/components/admin/AdminShell";
import { RouteGuard } from "@/shared/components/RouteGuard";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // اگر لودینگ تمام شد و کاربر لاگین نکرده باشد، به صفحه لاگین redirect کن
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // اگر در حال لود شدن است، چیزی نمایش نده
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-sm text-gray-500">در حال بررسی...</div>
        </div>
      </div>
    );
  }

  // اگر کاربر لاگین نکرده باشد، چیزی نمایش نده (در حال redirect است)
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-sm text-gray-500">در حال هدایت به صفحه ورود...</div>
        </div>
      </div>
    );
  }

  return (
    <RouteGuard>
      <AdminShell>{children}</AdminShell>
    </RouteGuard>
  );
}
