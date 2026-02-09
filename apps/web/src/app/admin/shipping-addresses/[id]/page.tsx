import { getAdminShippingAddress } from "@/modules/admin-shipping-addresses/api";

export const metadata = { title: "جزئیات آدرس ارسال | پنل مدیریت" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const a = await getAdminShippingAddress(id);

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold">کاربر</div>
                <div className="mt-2 text-xs text-slate-700 space-y-1">
                    <div>نام: {a.userFullName}</div>
                    <div>ایمیل: <span className="font-mono">{a.userEmail}</span></div>
                    {a.userPhone ? <div>تلفن: {a.userPhone}</div> : null}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold">آدرس ارسال</div>
                <div className="mt-2 text-xs text-slate-700 space-y-1">
                    <div>گیرنده: {a.receiverName} - {a.receiverPhone}</div>
                    <div>استان/شهر: {a.province} / {a.city}</div>
                    <div>آدرس: {a.addressLine}</div>
                    {a.postalCode ? <div>کدپستی: {a.postalCode}</div> : null}
                    <div>پیش‌فرض: {a.isDefault ? "بله" : "خیر"}</div>
                    <div>استفاده در سفارش: {a.usedInOrders ? "بله" : "خیر"}</div>
                    {a.notes ? <div>یادداشت: {a.notes}</div> : null}
                </div>
            </div>
        </div>
    );
}
