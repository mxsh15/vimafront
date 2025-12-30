import { AdminListPage } from "@/shared/components/AdminListPage";
import { trashShippingMethods } from "@/modules/shipping-methods/api";
import type { ShippingMethodListItemDto } from "@/modules/shipping-methods/types";
import { ShippingMethodTrashRowMenuCell } from "@/modules/shipping-methods/ui/ShippingMethodTrashRowMenuCell";

export const metadata = { title: "سطل زباله روش‌های ارسال" };

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string }>;
}) {
    const sp = await searchParams;
    const page = Number(sp.page ?? 1);
    const q = sp.q ?? "";

    const data = await trashShippingMethods({ page, pageSize: 20, q });

    return (
        <AdminListPage<ShippingMethodListItemDto>
            title="سطل زباله روش‌های ارسال"
            subtitle="موارد حذف شده را بازگردانی یا حذف دائمی کنید"
            basePath="/admin/shipping-methods/trash"
            data={data}
            q={q}
            createButton={null}
            showTrashButton={false}
            searchPlaceholder="جستجو..."
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => <ShippingMethodTrashRowMenuCell row={row} />}
            columns={[
                { id: "title", header: "عنوان", cell: (r) => r.title, cellClassName: "px-2 text-xs" },
                { id: "code", header: "کد", cell: (r) => <span className="font-mono text-xs">{r.code}</span>, cellClassName: "px-2" },
                { id: "status", header: "وضعیت", cell: (r) => (r.status ? "فعال" : "غیرفعال"), cellClassName: "px-2 text-xs text-slate-600" },
            ]}
        />
    );
}
