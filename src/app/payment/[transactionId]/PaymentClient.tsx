"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type VerifyResult = {
    success: boolean;
    orderId: string;
    paymentId: string;
    status: number | string;
};

export default function PaymentClient({ transactionId }: { transactionId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function verify(success: boolean) {
        setLoading(true);
        try {
            const token =
                typeof window !== "undefined"
                    ? localStorage.getItem("token") || localStorage.getItem("access_token")
                    : null;

            const res = await fetch("/api/payments/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    transactionId,
                    success,
                    referenceNumber: success ? `REF-${Date.now()}` : null,
                    failureReason: success ? null : "User canceled / failed",
                }),
            });


            if (!res.ok) {
                const text = await res.text().catch(() => "");
                console.log("VERIFY ERROR", res.status, text);
                throw new Error(text || `Verify failed (${res.status})`);
            }

            const data = (await res.json()) as VerifyResult;
            router.push(`/orders/${data.orderId}?paid=${success ? 1 : 0}`);
        } catch (e) {
            console.error(e);
            alert("خطا در تایید پرداخت");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container mx-auto p-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                <div className="text-xl font-bold">درگاه پرداخت (دمو)</div>
                <div className="text-sm text-slate-600">
                    TransactionId: <span className="font-mono">{transactionId}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        disabled={loading}
                        onClick={() => verify(true)}
                        className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm disabled:opacity-50"
                    >
                        پرداخت موفق
                    </button>

                    <button
                        disabled={loading}
                        onClick={() => verify(false)}
                        className="rounded-xl bg-rose-600 text-white px-4 py-2 text-sm disabled:opacity-50"
                    >
                        پرداخت ناموفق
                    </button>
                </div>

                <div className="text-xs text-slate-500">
                    این صفحه فقط برای دمو است. در پیاده‌سازی واقعی، پس از پرداخت در درگاه،
                    Callback/Redirect به سایت انجام می‌شود.
                </div>
            </div>
        </div>
    );
}
