"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type VerifyResult = { success: boolean; orderId: string; paymentId: string; status: number | string };

export default function PaymentPage({ params }: { params: { transactionId: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function verify(success: boolean) {
        setLoading(true);
        try {
            const res = await apiFetch<VerifyResult>("payments/verify", {
                method: "POST",
                body: JSON.stringify({
                    transactionId: params.transactionId,
                    success,
                    referenceNumber: success ? `REF-${Date.now()}` : null,
                    failureReason: success ? null : "User canceled / failed",
                }),
            });

            router.push(`/orders/${res.orderId}`);
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
                    TransactionId: <span className="font-mono">{params.transactionId}</span>
                </div>

                <div className="flex gap-2">
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
            </div>
        </div>
    );
}
