import { getWallet } from "@/modules/admin-vendor-finance/api";
import { WalletAdjustBox } from "@/modules/admin-vendor-finance/ui/WalletAdjustBox";

export const metadata = { title: "جزئیات کیف پول | پنل مدیریت" };

export default async function Page({ params }: { params: Promise<{ vendorId: string }> }) {
    const { vendorId } = await params;
    const data = await getWallet(vendorId, 80);

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="text-sm font-semibold">کیف پول فروشنده</div>
                        <div className="mt-2 text-xs text-slate-700 space-y-1">
                            <div>فروشگاه: <span className="font-medium">{data.wallet.storeName}</span></div>
                            <div>قابل برداشت: {data.wallet.balance.toLocaleString("fa-IR")}</div>
                            <div>در انتظار: {data.wallet.pendingBalance.toLocaleString("fa-IR")}</div>
                            <div>کل درآمد: {data.wallet.totalEarnings.toLocaleString("fa-IR")}</div>
                            <div>کل برداشت: {data.wallet.totalWithdrawn.toLocaleString("fa-IR")}</div>
                        </div>
                    </div>

                    <div className="min-w-[300px]">
                        <WalletAdjustBox vendorId={data.wallet.vendorId} />
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold">آخرین تراکنش‌ها</div>
                <div className="mt-2 overflow-x-auto">
                    <table className="min-w-[900px] w-full text-xs">
                        <thead className="text-slate-500">
                            <tr>
                                <th className="px-2 py-2 text-right">تاریخ</th>
                                <th className="px-2 py-2 text-right">نوع</th>
                                <th className="px-2 py-2 text-right">مبلغ</th>
                                <th className="px-2 py-2 text-right">مانده</th>
                                <th className="px-2 py-2 text-right">شرح</th>
                                <th className="px-2 py-2 text-right">Ref</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.transactions.map((t) => (
                                <tr key={t.id} className="border-t">
                                    <td className="px-2 py-2">{new Date(t.createdAtUtc).toLocaleString("fa-IR")}</td>
                                    <td className="px-2 py-2">{t.type}</td>
                                    <td className="px-2 py-2">{Number(t.amount).toLocaleString("fa-IR")}</td>
                                    <td className="px-2 py-2">{Number(t.balanceAfter).toLocaleString("fa-IR")}</td>
                                    <td className="px-2 py-2">{t.description ?? "-"}</td>
                                    <td className="px-2 py-2 font-mono">{t.referenceNumber ?? "-"}</td>
                                </tr>
                            ))}
                            {!data.transactions.length ? (
                                <tr><td className="px-2 py-3 text-slate-500" colSpan={6}>تراکنشی وجود ندارد.</td></tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
