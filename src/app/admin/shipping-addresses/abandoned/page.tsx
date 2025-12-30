import { AdminListPage } from "@/shared/components/AdminListPage";
import type { AdminShippingAddressListItemDto } from "@/modules/admin-shipping-addresses/types";
import { listAbandonedAdminShippingAddresses } from "@/modules/admin-shipping-addresses/api";
import { ShippingAddressRowMenuCell } from "@/modules/admin-shipping-addresses/ui/ShippingAddressRowMenuCell";

export const metadata = { title: "آدرس‌های رهاشده | پنل مدیریت" };

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; days?: string }> }) {
    const sp = await searchParams;
    const page = Number(sp?.page ?? 1);
    const q = sp?.q ?? "";
    const days = Number(sp?.days ?? 30);

    const data = await listAbandonedAdminShippingAddresses({ page, pageSize: 20, q, days });

    return (
        <AdminListPage<AdminShippingAddressListItemDto>
            title="آدرس‌های رهاشده"
            subtitle={`آدرس‌هایی که در سفارش استفاده نشده‌اند و بیشتر از ${days} روز بدون تغییر مانده‌اند`}
            basePath="/admin/shipping-addresses/abandoned"
            data={data}
            q={q}
            createButton={null as any}
            showTrashButton
            trashHref="/admin/shipping-addresses/trash"
            trashLabel="سطل زباله آدرس‌ها"
            searchPlaceholder="جستجو..."
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => <ShippingAddressRowMenuCell row={row} />}
            columns={[
                { id: "user", header: "کاربر", cell: (r) => r.userFullName, cellClassName: "px-2 text-xs" },
                { id: "receiver", header: "گیرنده", cell: (r) => `${r.receiverName} - ${r.receiverPhone}`, cellClassName: "px-2 text-xs" },
                { id: "loc", header: "شهر", cell: (r) => `${r.province} / ${r.city}`, cellClassName: "px-2 text-xs" },
                { id: "addr", header: "آدرس", cell: (r) => r.addressLine, cellClassName: "px-2 text-xs max-w-[420px] truncate" },
                { id: "created", header: "ایجاد", cell: (r) => new Date(r.createdAtUtc).toLocaleDateString("fa-IR"), cellClassName: "px-2 text-xs" },
            ]}
        />
    );
}
