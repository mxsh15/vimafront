"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getMyOrder } from "@/modules/order/public-api";
import type { OrderDto } from "@/modules/order/types";

export default function OrderClient({ id }: { id: string }) {
    const sp = useSearchParams();
    const paid = sp.get("paid");

    const [order, setOrder] = useState<OrderDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string>("");

    useEffect(() => {
        let mounted = true;

        (async () => {
            setLoading(true);
            setErr("");

            try {
                const data = await getMyOrder(id);
                if (mounted) setOrder(data);
            } catch (e: any) {
                if (mounted) setErr(e?.message || "خطا در دریافت سفارش");
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [id]);

    if (loading) return <div className="p-6">در حال بارگذاری...</div>;
    if (err) return <div className="p-6 text-rose-600">{err}</div>;
    if (!order) return <div className="p-6">سفارش یافت نشد.</div>;

    return (
        <div className="container mx-auto p-6 space-y-4">
            {paid === "1" && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                    پرداخت با موفقیت ثبت شد ✅
                </div>
            )}

            <div className="rounded-2xl border bg-white p-6">
                <div className="text-lg font-bold">سفارش {order.orderNumber}</div>
                <div className="mt-2 text-sm text-slate-600">
                    وضعیت سفارش: <span className="font-medium">{String(order.status)}</span>
                </div>
            </div>
        </div>
    );
}
