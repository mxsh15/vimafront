import { AdminListPage } from "@/shared/components/AdminListPage";
import type { AdminShippingAddressListItemDto } from "@/modules/admin-shipping-addresses/types";
import { listDeletedAdminShippingAddresses } from "@/modules/admin-shipping-addresses/api";
import { ShippingAddressTrashRowMenuCell } from "@/modules/admin-shipping-addresses/ui/ShippingAddressTrashRowMenuCell";

export const metadata = { title: "سطل زباله آدرس‌ها | پنل مدیریت" };

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
    const sp = await searchParams;
    const page = Number(sp?.page ?? 1);
    const q = sp?.q ?? "";

    const data = await listDeletedAdminShippingAddresses({ page, pageSize: 20, q });

    return (
        <AdminListPage<AdminShippingAddressListItemDto>
            title="سطل زباله آدرس‌های ارسال"
            subtitle="بازیابی یا حذف دائمی"
            basePath="/admin/shipping-addresses/trash"
            data={data}
            q={q}
            createButton={null as any}
            showTrashButton={false}
            searchPlaceholder="جستجو..."
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => <ShippingAddressTrashRowMenuCell row={row} />}
            columns={[
                { id: "user", header: "کاربر", cell: (r) => r.userFullName, cellClassName: "px-2 text-xs" },
                { id: "receiver", header: "گیرنده", cell: (r) => `${r.receiverName} - ${r.receiverPhone}`, cellClassName: "px-2 text-xs" },
                { id: "loc", header: "شهر", cell: (r) => `${r.province} / ${r.city}`, cellClassName: "px-2 text-xs" },
                { id: "deleted", header: "حذف شده در", cell: (r) => (r.deletedAtUtc ? new Date(r.deletedAtUtc).toLocaleDateString("fa-IR") : "-"), cellClassName: "px-2 text-xs" },
            ]}
        />
    );
}
