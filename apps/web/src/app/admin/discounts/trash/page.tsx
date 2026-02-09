import { AdminListPage } from "@/shared/components/AdminListPage";
import { listTrashDiscounts } from "@/modules/discounts/api";
import type { DiscountListItemDto } from "@/modules/discounts/types";
import Link from "next/link";
import { DiscountTrashRowMenuCell } from "@/modules/discounts/ui/DiscountTrashRowMenuCell";

export const metadata = { title: "سطل زباله تخفیف‌ها | پنل مدیریت" };

export default async function Page({
    searchParams,
}: {
    searchParams: { q?: string; page?: string; pageSize?: string };
}) {
    const q = searchParams.q ?? "";
    const page = Number(searchParams.page ?? "1");
    const pageSize = Number(searchParams.pageSize ?? "20");

    const data = await listTrashDiscounts({ q, page, pageSize });

    const columns = [
        {
            header: "عنوان",
            cell: (row: DiscountListItemDto) => row.title ?? "—"
        },
        {
            header: "محدوده",
            cell: (row: DiscountListItemDto) => (row as any).scopeTitle ?? (row as any).scope ?? "—"
        },
        {
            header: "مقدار",
            cell: (row: DiscountListItemDto) => (row as any).value ?? "—"
        },
        {
            header: "زمان حذف",
            cell: (row: DiscountListItemDto) => {
                return row.deletedAt ? new Date(row.deletedAt).toLocaleString("fa-IR") : "—";
            },
        },
    ];


    return (
        <AdminListPage<DiscountListItemDto>
            title="سطل زباله تخفیف‌ها"
            basePath="/admin/discounts/trash"
            data={data}
            q={q}
            searchPlaceholder="جستجو در سطل زباله..."
            enableStatusFilter={false}
            totalLabel={`${data.totalCount} تخفیف در سطل زباله`}
            emptyMessage="هیچ تخفیفی در سطل زباله نیست."
            rowMenuHeader="عملیات"
            showTrashButton={false}
            createButton={
                <Link
                    href="/admin/discounts"
                    className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                    ← بازگشت به لیست تخفیف‌ها
                </Link>
            }
            rowMenuCell={(row) => <DiscountTrashRowMenuCell discount={row} />}
            columns={columns as any} />
    );
}
