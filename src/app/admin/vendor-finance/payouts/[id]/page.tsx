import { getPayout } from "@/modules/admin-vendor-finance/api";
import { PayoutDetailActions } from "@/modules/admin-vendor-finance/ui/PayoutDetailActions";

export const metadata = { title: "جزئیات تسویه | پنل مدیریت" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const p = await getPayout(id);

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="text-sm font-semibold">درخواست تسویه</div>
                        <div className="mt-2 text-xs text-slate-700 space-y-1">
                            <div>فروشگاه: <span className="font-medium">{p.storeName}</span></div>
                            <div>مبلغ: {Number(p.amount).toLocaleString("fa-IR")}</div>
                            <div>وضعیت: <span className="font-medium">{p.status}</span></div>
                            <div>RequestedAt: {new Date(p.requestedAt).toLocaleString("fa-IR")}</div>
                            <div>ProcessedAt: {p.processedAt ? new Date(p.processedAt).toLocaleString("fa-IR") : "-"}</div>
                            <div>Bank: {p.bankName ?? "-"}</div>
                            <div>Account: <span className="font-mono">{p.accountNumber ?? "-"}</span></div>
                            <div>Shaba: <span className="font-mono">{p.shabaNumber ?? "-"}</span></div>
                        </div>
                    </div>

                    <div className="min-w-[320px]">
                        <PayoutDetailActions payout={p} />
                    </div>
                </div>
            </div>

            {p.adminNotes ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-700">
                    <div className="text-sm font-semibold">یادداشت ادمین</div>
                    <div className="mt-2">{p.adminNotes}</div>
                </div>
            ) : null}
        </div>
    );
}
