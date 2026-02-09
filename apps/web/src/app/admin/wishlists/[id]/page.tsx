import { getAdminWishlist } from "@/modules/admin-wishlists/api";

export const metadata = { title: "جزئیات Wishlist | پنل مدیریت" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const w = await getAdminWishlist(id);

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold">Wishlist</div>
                <div className="mt-2 text-xs text-slate-700 space-y-1">
                    <div>کاربر: <span className="font-medium">{w.userFullName}</span></div>
                    <div>ایمیل: <span className="font-mono">{w.userEmail}</span></div>
                    <div>نام لیست: {w.name ?? (w.isDefault ? "پیش‌فرض" : "-")}</div>
                    <div>تعداد آیتم‌ها: {w.items.length}</div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold">آیتم‌ها</div>
                <div className="mt-2 overflow-x-auto">
                    <table className="min-w-[900px] w-full text-xs">
                        <thead className="text-slate-500">
                            <tr>
                                <th className="px-2 py-2 text-right">محصول</th>
                                <th className="px-2 py-2 text-right">Vendor</th>
                                <th className="px-2 py-2 text-right">تاریخ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {w.items.map((i) => (
                                <tr key={i.id} className="border-t">
                                    <td className="px-2 py-2">{i.productTitle}</td>
                                    <td className="px-2 py-2">{i.vendorName ?? "-"}</td>
                                    <td className="px-2 py-2">{new Date(i.createdAtUtc).toLocaleString("fa-IR")}</td>
                                </tr>
                            ))}
                            {!w.items.length ? (
                                <tr><td className="px-2 py-3 text-slate-500" colSpan={3}>آیتمی وجود ندارد.</td></tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
