"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/modules/auth/actions";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/button/Button";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { login, isAuthenticated, user, loading } = useAuth();

  // اگر کاربر قبلاً لاگین کرده باشد، به داشبورد مناسب redirect کن
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (user.role === "Admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  }, [isAuthenticated, user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result.success && result.data) {
        login(result.data.token, result.data.user);
        // ریدایرکت بر اساس نقش کاربر
        if (result.data.user.role === "Admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        setError(result.error || "خطا در ورود");
      }
    });
  }

  // اگر در حال لود شدن است یا کاربر قبلاً لاگین کرده، چیزی نمایش نده
  if (loading || (isAuthenticated && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 text-sm text-gray-500">در حال هدایت...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            ورود به حساب کاربری
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                ایمیل
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                placeholder="example@email.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                رمز عبور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full bg-blue-800"
              disabled={pending}
            >
              {pending ? "در حال ورود..." : "ورود"}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              حساب کاربری ندارید؟{" "}
              <Link
                href="/register"
                className="font-medium text-brand-600 hover:text-brand-500"
              >
                ثبت‌نام کنید
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

