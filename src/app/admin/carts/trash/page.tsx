import { AdminListPage } from "@/shared/components/AdminListPage";
import { listDeletedAdminCarts } from "@/modules/admin-carts/api";
import type { AdminCartListItemDto } from "@/modules/admin-carts/types";
import { CartTrashRowMenuCell } from "@/modules/admin-carts/ui/CartTrashRowMenuCell";

export const metadata = { title: "سطل زباله سبدها | پنل مدیریت" };

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string }>;
}) {
    const params = await searchParams;
    const page = Number(params?.page ?? 1);
    const q = params?.q ?? "";

    const data = await listDeletedAdminCarts({ page, pageSize: 20, q });

    return (
        <AdminListPage<AdminCartListItemDto>
            title="سطل زباله سبدهای خرید"
            subtitle="بازیابی یا حذف دائمی"
            basePath="/admin/carts/trash"
            data={data}
            q={q}
            createButton={null as any}
            showTrashButton={false}
            searchPlaceholder="جستجو..."
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => <CartTrashRowMenuCell cart={row} />}
            columns={[
                { id: "user", header: "کاربر", cell: (r) => r.userFullName, cellClassName: "px-2 text-xs" },
                { id: "email", header: "ایمیل", cell: (r) => r.userEmail, cellClassName: "px-2 text-xs font-mono" },
                { id: "items", header: "تعداد آیتم", cell: (r) => String(r.totalItems), cellClassName: "px-2 text-xs" },
                { id: "deleted", header: "حذف شده در", cell: (r) => (r.deletedAtUtc ? new Date(r.deletedAtUtc).toLocaleDateString("fa-IR") : "-"), cellClassName: "px-2 text-xs" },
            ]}
        />
    );
}
