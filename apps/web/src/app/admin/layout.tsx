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
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login"); // بهتر از push
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-sm text-gray-500">در حال بررسی...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-sm text-gray-500">
            در حال هدایت به صفحه ورود...
          </div>
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
