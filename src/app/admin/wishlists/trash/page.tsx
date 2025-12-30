import { AdminListPage } from "@/shared/components/AdminListPage";
import { listAdminWishlistsTrash } from "@/modules/admin-wishlists/api";
import type { AdminWishlistListItemDto } from "@/modules/admin-wishlists/types";
import { WishlistTrashRowMenuCell } from "@/modules/admin-wishlists/ui/WishlistTrashRowMenuCell";

export const metadata = { title: "Trash Wishlists | پنل مدیریت" };

export default async function Page({
    searchParams,
}: { searchParams: Promise<{ page?: string; q?: string }> }) {
    const sp = await searchParams;
    const page = Number(sp?.page ?? 1);
    const q = sp?.q ?? "";

    const data = await listAdminWishlistsTrash({ page, pageSize: 20, q });

    return (
        <AdminListPage<AdminWishlistListItemDto>
            title="سطل زباله Wishlists"
            subtitle="بازیابی یا حذف دائمی"
            basePath="/admin/wishlists/trash"
            data={data}
            q={q}
            createButton={null as any}
            showTrashButton={false}
            searchPlaceholder="جستجو..."
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => <WishlistTrashRowMenuCell row={row} />}
            columns={[
                { id: "user", header: "کاربر", cell: (r) => r.userFullName, cellClassName: "px-2 text-xs" },
                { id: "email", header: "ایمیل", cell: (r) => r.userEmail, cellClassName: "px-2 text-xs font-mono" },
                { id: "count", header: "تعداد آیتم", cell: (r) => r.itemsCount, cellClassName: "px-2 text-xs text-center" },
                { id: "deleted", header: "حذف شده", cell: (r) => r.deletedAtUtc ? new Date(r.deletedAtUtc).toLocaleDateString("fa-IR") : "-", cellClassName: "px-2 text-[11px] text-slate-400" },
            ]}
        />
    );
}
