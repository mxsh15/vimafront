import { listPriceDiscrepancies } from "@/modules/admin-vendor-offers/api";
import type { AdminPriceDiscrepancyRowDto } from "@/modules/admin-vendor-offers/types";
import { AdminPaginationBar } from "@/shared/components/AdminPaginationBar";
import { ListSearchBox } from "@/shared/components/ListSearchBox";

export const metadata = { title: "گزارش اختلاف قیمت‌ها | پنل مدیریت" };

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
    const sp = await searchParams;
    const page = Number(sp?.page ?? 1);
    const q = sp?.q ?? "";

    const data = await listPriceDiscrepancies({
        page,
        pageSize: 20,
        q,
        minOffers: 2,
        thresholdPercent: 30,
        onlyApproved: true,
    });

    return (
        <main className="flex-1 px-6 pb-6 pt-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-sm font-semibold text-slate-900">گزارش اختلاف قیمت‌ها</h1>
                    <p className="mt-1 text-[11px] text-slate-400">محصولاتی که بین فروشندگان اختلاف قیمت قابل‌توجه دارند</p>
                </div>
                <a href="/admin/vendor-offers" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px]">← برگشت</a>
            </div>

            <section className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                        <ListSearchBox placeholder="جستجو محصول..." />
                        <div className="text-[11px] text-slate-500">Threshold: 30%</div>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    {data.items.map((r: AdminPriceDiscrepancyRowDto) => (
                        <div key={r.productId} className="rounded-2xl border border-slate-200 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="text-xs font-semibold">{r.productTitle}</div>
                                <div className="text-[11px] text-slate-600">
                                    {r.offersCount} فروشنده · اختلاف: {Number(r.spreadPercent).toFixed(1)}%
                                </div>
                            </div>

                            <div className="mt-2 text-xs text-slate-700 flex flex-wrap gap-4">
                                <span>Min: {Number(r.minPrice).toLocaleString("fa-IR")}</span>
                                <span>Max: {Number(r.maxPrice).toLocaleString("fa-IR")}</span>
                                <span>Avg: {Number(r.avgPrice).toLocaleString("fa-IR")}</span>
                            </div>

                            <div className="mt-3 overflow-x-auto">
                                <table className="min-w-[700px] w-full text-xs">
                                    <thead className="text-slate-500">
                                        <tr>
                                            <th className="px-2 py-2 text-right">فروشنده</th>
                                            <th className="px-2 py-2 text-right">قیمت</th>
                                            <th className="px-2 py-2 text-right">تخفیف</th>
                                            <th className="px-2 py-2 text-right">وضعیت</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {r.offers.map((o) => (
                                            <tr key={o.offerId} className="border-t">
                                                <td className="px-2 py-2">{o.vendorName}</td>
                                                <td className="px-2 py-2">{Number(o.price).toLocaleString("fa-IR")}</td>
                                                <td className="px-2 py-2">{o.discountPrice ? Number(o.discountPrice).toLocaleString("fa-IR") : "-"}</td>
                                                <td className="px-2 py-2">{o.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}

                    {!data.items.length ? <div className="text-xs text-slate-500">موردی یافت نشد.</div> : null}
                </div>

                <AdminPaginationBar basePath="/admin/vendor-offers/price-discrepancies" page={data.page} pageSize={data.pageSize} totalCount={data.totalCount} q={q} />
            </section>
        </main>
    );
}
