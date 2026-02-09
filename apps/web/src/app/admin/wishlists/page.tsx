import { AdminListPage } from "@/shared/components/AdminListPage";
import { listAdminWishlists } from "@/modules/admin-wishlists/api";
import type { AdminWishlistListItemDto } from "@/modules/admin-wishlists/types";
import { WishlistRowMenuCell } from "@/modules/admin-wishlists/ui/WishlistRowMenuCell";

export const metadata = { title: "Wishlists | پنل مدیریت" };

export default async function Page({
    searchParams,
}: { searchParams: Promise<{ page?: string; q?: string }> }) {
    const sp = await searchParams;
    const page = Number(sp?.page ?? 1);
    const q = sp?.q ?? "";

    const data = await listAdminWishlists({ page, pageSize: 20, q });

    return (
        <AdminListPage<AdminWishlistListItemDto>
            title="Wishlists"
            subtitle="لیست علاقه‌مندی‌های کاربران"
            basePath="/admin/wishlists"
            data={data}
            q={q}
            createButton={null as any}
            showTrashButton
            trashHref="/admin/wishlists/trash"
            trashLabel="سطل زباله"
            searchPlaceholder="جستجو: نام لیست/نام کاربر/ایمیل..."
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => <WishlistRowMenuCell row={row} />}
            columns={[
                { id: "user", header: "کاربر", cell: (r) => r.userFullName, cellClassName: "px-2 text-xs" },
                { id: "email", header: "ایمیل", cell: (r) => r.userEmail, cellClassName: "px-2 text-xs font-mono" },
                { id: "name", header: "نام لیست", cell: (r) => r.name ?? (r.isDefault ? "پیش‌فرض" : "-"), cellClassName: "px-2 text-xs" },
                { id: "count", header: "تعداد آیتم", cell: (r) => r.itemsCount, cellClassName: "px-2 text-xs text-center" },
                { id: "created", header: "تاریخ", cell: (r) => new Date(r.createdAtUtc).toLocaleDateString("fa-IR"), cellClassName: "px-2 text-[11px] text-slate-400" },
            ]}
        />
    );
}
