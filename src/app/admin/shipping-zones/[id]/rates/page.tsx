import { getShippingZoneRates } from "@/modules/shipping-zones/api";
import { listShippingMethods } from "@/modules/shipping-methods/api";
import ZoneRatesEditor from "@/modules/shipping-zones/ui/ZoneRatesEditor";

export const metadata = { title: "نرخ‌های منطقه ارسال" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [rates, methodsPaged] = await Promise.all([
        getShippingZoneRates(id),
        listShippingMethods({ page: 1, pageSize: 500 }),
    ]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-sm font-semibold text-slate-800">نرخ‌های ارسال</h1>
                <p className="text-xs text-slate-500">برای هر روش ارسال، قیمت و قوانین را تنظیم کنید</p>
            </div>

            <ZoneRatesEditor zoneId={id} methods={methodsPaged.items} initialRates={rates} />
        </div>
    );
}
