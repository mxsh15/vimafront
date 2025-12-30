import { AdminListPage } from "@/shared/components/AdminListPage";
import type { ShippingMethodListItemDto } from "@/modules/shipping-methods/types";
import { listShippingMethods } from "@/modules/shipping-methods/api";
import { ShippingMethodCreateButton } from "@/modules/shipping-methods/ui/ShippingMethodCreateButton";
import { ShippingMethodRowMenuCell } from "@/modules/shipping-methods/ui/ShippingMethodRowMenuCell";

export const metadata = { title: "روش‌های ارسال" };

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string }>;
}) {
    const sp = await searchParams;
    const page = Number(sp.page ?? 1);
    const q = sp.q ?? "";

    const data = await listShippingMethods({ page, pageSize: 20, q });

    return (
        <AdminListPage<ShippingMethodListItemDto>
            title="روش‌های ارسال"
            subtitle="مدیریت روش‌های ارسال (پست، تیپاکس، پیک و ...)"
            basePath="/admin/shipping-methods"
            data={data}
            q={q}
            createButton={<ShippingMethodCreateButton />}
            showTrashButton
            trashHref="/admin/shipping-methods/trash"
            trashLabel="سطل زباله"
            searchPlaceholder="جستجوی روش ارسال..."
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => <ShippingMethodRowMenuCell row={row} />}
            columns={[
                { id: "title", header: "عنوان", cell: (r) => r.title, cellClassName: "px-2 text-xs" },
                { id: "code", header: "کد", cell: (r) => <span className="font-mono text-xs">{r.code}</span>, cellClassName: "px-2" },
                { id: "status", header: "وضعیت", cell: (r) => (r.status ? "فعال" : "غیرفعال"), cellClassName: "px-2 text-xs text-slate-600" },
                {
                    id: "defaultPrice",
                    header: "پیش‌فرض",
                    cell: (r) => (r.defaultPrice == null ? "-" : `${Number(r.defaultPrice).toLocaleString("fa-IR")} تومان`),
                    cellClassName: "px-2 text-xs",
                },
            ]}
        />
    );
}
