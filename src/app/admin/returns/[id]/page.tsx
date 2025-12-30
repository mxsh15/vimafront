import { getAdminReturn } from "@/modules/admin-returns/api";
import { ReturnDetailActions } from "@/modules/admin-returns/ui/ReturnDetailActions";

export const metadata = { title: "جزئیات مرجوعی | پنل مدیریت" };

function faDateTime(iso?: string | null) {
    if (!iso) return "-";
    try {
        return new Date(iso).toLocaleString("fa-IR");
    } catch {
        return "-";
    }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const r = await getAdminReturn(id);

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="text-sm font-semibold">اطلاعات درخواست</div>
                        <div className="mt-2 text-xs text-slate-700 space-y-1">
                            <div>سفارش: <span className="font-mono">{r.orderNumber}</span></div>
                            <div>مشتری: {r.customerName}</div>
                            <div>ایمیل: <span className="font-mono">{r.customerEmail}</span></div>
                            <div>وضعیت: <span className="font-medium">{r.status}</span></div>
                            <div>زمان درخواست: {faDateTime(r.requestedAt)}</div>
                            <div>تایید در: {faDateTime(r.approvedAt)}</div>
                            <div>تکمیل در: {faDateTime(r.completedAt)}</div>
                        </div>
                    </div>

                    <div className="min-w-[260px]">
                        <ReturnDetailActions returnId={r.id} current={r} />
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold">علت و توضیحات</div>
                <div className="mt-2 text-xs text-slate-700 space-y-2">
                    <div>
                        <span className="text-slate-500">علت:</span> {r.reason}
                    </div>
                    {r.description ? (
                        <div>
                            <span className="text-slate-500">توضیحات:</span> {r.description}
                        </div>
                    ) : null}
                    {r.adminNotes ? (
                        <div>
                            <span className="text-slate-500">یادداشت ادمین:</span> {r.adminNotes}
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold">Refund</div>
                <div className="mt-2 text-xs text-slate-700">
                    {r.refund ? (
                        <div className="space-y-1">
                            <div>PaymentId: <span className="font-mono">{r.refund.paymentId}</span></div>
                            <div>Amount: {Number(r.refund.amount).toLocaleString("fa-IR")} تومان</div>
                            <div>Status: {r.refund.status}</div>
                            <div>TransactionId: {r.refund.transactionId ?? "-"}</div>
                            <div>Failure: {r.refund.failureReason ?? "-"}</div>
                            <div>CreatedAt: {faDateTime(r.refund.createdAt)}</div>
                            <div>ProcessedAt: {faDateTime(r.refund.processedAt)}</div>
                        </div>
                    ) : (
                        <div className="text-slate-500">برای این درخواست هنوز Refund ثبت نشده است.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
