"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type ApiResult = { message?: string };

export default function EmergencyResetPasswordClient() {
  const { isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOkMsg(null);
    setErrMsg(null);

    if (!email.trim() || !newPassword.trim()) {
      setErrMsg("ایمیل و رمز جدید باید وارد شوند.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/emergency-reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          newPassword: newPassword,
        }),
      });

      let data: ApiResult | null = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        const msg =
          data?.message ||
          (res.status === 404
            ? "این قابلیت فعال نیست یا دسترسی ندارید."
            : `خطا (${res.status})`);
        setErrMsg(msg);
        return;
      }
      setOkMsg(data?.message || "رمز عبور با موفقیت ریست شد.");
      setNewPassword("");
    } catch (err: any) {
      setErrMsg(err?.message || "خطای شبکه/سرور");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-semibold">ریست اضطراری رمز عبور</h1>
      <p className="mt-2 text-sm text-gray-600">
        این صفحه فقط برای وقتی است که ایمیل/پیامک هنوز راه نیفتاده و ادمین رمز
        را فراموش کرده. کلید اضطراری را از تنظیمات سرور بردارید و اینجا وارد
        کنید. هیچ جا ذخیره نمی‌شود.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">ایمیل ادمین</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            رمز عبور جدید
          </label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="NewStrongPass123!"
            type="password"
            autoComplete="new-password"
          />
        </div>

        {errMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errMsg}
          </div>
        )}
        {okMsg && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {okMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg px-4 py-2 border bg-black text-white disabled:opacity-60"
        >
          {loading ? "در حال ارسال..." : "ریست رمز عبور"}
        </button>
      </form>
    </div>
  );
}
