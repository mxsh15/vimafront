import { AdminListPage } from "@/shared/components/AdminListPage";
import { listShippingZones } from "@/modules/shipping-zones/api";
import type { ShippingZoneListItemDto } from "@/modules/shipping-zones/types";
import { ShippingZoneCreateButton } from "@/modules/shipping-zones/ui/ShippingZoneCreateButton";
import { ShippingZoneRowMenuCell } from "@/modules/shipping-zones/ui/ShippingZoneRowMenuCell";

export const metadata = { title: "مناطق ارسال" };

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string }>;
}) {
    const sp = await searchParams;
    const page = Number(sp.page ?? 1);
    const q = sp.q ?? "";

    const data = await listShippingZones({ page, pageSize: 20, q });

    return (
        <AdminListPage<ShippingZoneListItemDto>
            title="مناطق ارسال"
            subtitle="مدیریت مناطق ارسال و تنظیم نرخ‌ها برای هر روش ارسال"
            basePath="/admin/shipping-zones"
            data={data}
            q={q}
            createButton={<ShippingZoneCreateButton />}
            showTrashButton={false}
            searchPlaceholder="جستجوی منطقه..."
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => <ShippingZoneRowMenuCell row={row} />}
            columns={[
                { id: "title", header: "عنوان", cell: (r) => r.title, cellClassName: "px-2 text-xs" },
                { id: "loc", header: "محدوده", cell: (r) => [r.countryCode, r.province, r.city].filter(Boolean).join(" / ") || "-", cellClassName: "px-2 text-xs text-slate-600" },
                { id: "status", header: "وضعیت", cell: (r) => (r.status ? "فعال" : "غیرفعال"), cellClassName: "px-2 text-xs text-slate-600" },
            ]}
        />
    );
}
