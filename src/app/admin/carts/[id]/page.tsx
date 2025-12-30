import { getAdminCart } from "@/modules/admin-carts/api";

export const metadata = { title: "جزئیات سبد خرید | پنل مدیریت" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const cart = await getAdminCart(id);

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold">اطلاعات کاربر</div>
                <div className="mt-2 text-xs text-slate-700">
                    <div>نام: {cart.userFullName}</div>
                    <div>ایمیل: <span className="font-mono">{cart.userEmail}</span></div>
                    {cart.userPhone ? <div>تلفن: {cart.userPhone}</div> : null}
                    <div>تعداد آیتم: {cart.totalItems}</div>
                    <div>جمع: {Number(cart.totalPrice).toLocaleString("fa-IR")} تومان</div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold">آیتم‌های سبد</div>

                <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 text-slate-500">
                                <th className="px-2 py-2 text-right">محصول</th>
                                <th className="px-2 py-2 text-right">تعداد</th>
                                <th className="px-2 py-2 text-right">قیمت واحد</th>
                                <th className="px-2 py-2 text-right">جمع</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.items.map((it) => (
                                <tr key={it.id} className="border-b border-slate-100">
                                    <td className="px-2 py-2">{it.productTitle}</td>
                                    <td className="px-2 py-2">{it.quantity}</td>
                                    <td className="px-2 py-2">{Number(it.unitPrice).toLocaleString("fa-IR")}</td>
                                    <td className="px-2 py-2">{Number(it.totalPrice).toLocaleString("fa-IR")}</td>
                                </tr>
                            ))}
                            {cart.items.length === 0 ? (
                                <tr>
                                    <td className="px-2 py-3 text-slate-500" colSpan={4}>
                                        این سبد آیتمی ندارد.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
