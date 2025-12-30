import { AdminListPage } from "@/shared/components/AdminListPage";
import { listAdminCarts } from "@/modules/admin-carts/api";
import type { AdminCartListItemDto } from "@/modules/admin-carts/types";
import { CartRowMenuCell } from "@/modules/admin-carts/ui/CartRowMenuCell";

export const metadata = { title: "سبدهای خرید | پنل مدیریت" };

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string }>;
}) {
    const params = await searchParams;
    const page = Number(params?.page ?? 1);
    const q = params?.q ?? "";

    const data = await listAdminCarts({ page, pageSize: 20, q });

    return (
        <AdminListPage<AdminCartListItemDto>
            title="سبدهای خرید"
            subtitle="مدیریت سبدهای خرید کاربران"
            basePath="/admin/carts"
            data={data}
            q={q}
            createButton={null as any}
            showTrashButton={true}
            trashHref="/admin/carts/trash"
            trashLabel="سطل زباله سبدها"
            searchPlaceholder="جستجو بر اساس نام/ایمیل/شناسه سبد..."
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => <CartRowMenuCell row={row} />}
            columns={[
                { id: "user", header: "کاربر", cell: (r) => r.userFullName, cellClassName: "px-2 text-xs" },
                { id: "email", header: "ایمیل", cell: (r) => r.userEmail, cellClassName: "px-2 text-xs font-mono" },
                { id: "items", header: "تعداد آیتم", cell: (r) => String(r.totalItems), cellClassName: "px-2 text-xs" },
                { id: "price", header: "جمع", cell: (r) => Number(r.totalPrice).toLocaleString("fa-IR") + " تومان", cellClassName: "px-2 text-xs" },
                { id: "created", header: "ایجاد", cell: (r) => new Date(r.createdAtUtc).toLocaleDateString("fa-IR"), cellClassName: "px-2 text-xs" },
            ]}
        />
    );
}
