import { AdminListPage } from "@/shared/components/AdminListPage";
import type { AdminShippingAddressListItemDto } from "@/modules/admin-shipping-addresses/types";
import { listAdminShippingAddresses } from "@/modules/admin-shipping-addresses/api";
import { ShippingAddressRowMenuCell } from "@/modules/admin-shipping-addresses/ui/ShippingAddressRowMenuCell";

export const metadata = { title: "آدرس‌های ارسال | پنل مدیریت" };

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; mode?: string }> }) {
    const sp = await searchParams;
    const page = Number(sp?.page ?? 1);
    const q = sp?.q ?? "";
    const mode = (sp?.mode ?? "all") as any;

    const data = await listAdminShippingAddresses({ page, pageSize: 20, q, mode });

    return (
        <AdminListPage<AdminShippingAddressListItemDto>
            title="آدرس‌های ارسال"
            subtitle="مدیریت آدرس‌های ارسال کاربران"
            basePath="/admin/shipping-addresses"
            data={data}
            q={q}
            createButton={null as any}
            showTrashButton
            trashHref="/admin/shipping-addresses/trash"
            trashLabel="سطل زباله آدرس‌ها"
            searchPlaceholder="جستجو: نام گیرنده/تلفن/شهر/ایمیل/شناسه..."
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => <ShippingAddressRowMenuCell row={row} />}
            columns={[
                { id: "user", header: "کاربر", cell: (r) => r.userFullName, cellClassName: "px-2 text-xs" },
                { id: "receiver", header: "گیرنده", cell: (r) => `${r.receiverName} - ${r.receiverPhone}`, cellClassName: "px-2 text-xs" },
                { id: "loc", header: "شهر", cell: (r) => `${r.province} / ${r.city}`, cellClassName: "px-2 text-xs" },
                { id: "addr", header: "آدرس", cell: (r) => r.addressLine, cellClassName: "px-2 text-xs max-w-[420px] truncate" },
                { id: "used", header: "استفاده در سفارش", cell: (r) => (r.usedInOrders ? "بله" : "خیر"), cellClassName: "px-2 text-xs" },
                { id: "def", header: "پیش‌فرض", cell: (r) => (r.isDefault ? "✓" : "-"), cellClassName: "px-2 text-xs" },
            ]}
        />
    );
}
