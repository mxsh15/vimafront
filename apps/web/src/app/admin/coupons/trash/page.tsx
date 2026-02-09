import { AdminListPage } from "@/shared/components/AdminListPage";
import type { CouponListItemDto } from "@/modules/coupons/types";
import { CouponTrashRowMenuCell } from "@/modules/coupons/ui/CouponTrashRowMenuCell";
import Link from "next/link";
import { listCouponsTrash } from "@/modules/coupons/api";

export const metadata = { title: "سطل زباله کوپن‌ها | پنل مدیریت" };

export default async function Page({
    searchParams,
}: {
    searchParams: { q?: string; page?: string; pageSize?: string };
}) {
    const q = searchParams.q ?? "";
    const page = Number(searchParams.page ?? "1");
    const pageSize = Number(searchParams.pageSize ?? "20");

    const data = await listCouponsTrash({ q, page, pageSize });

    const columns = [
        {
            header: "کد",
            cell: (row: CouponListItemDto) => row.code,
        },
        {
            header: "عنوان",
            cell: (row: CouponListItemDto) => row.title,
        },
        {
            header: "نوع",
            cell: (row: CouponListItemDto) => {
                // اگر type عددی شد (0/1)
                if (row.type === 0) return "درصدی";
                if (row.type === 1) return "مبلغ ثابت";
                // اگر string بود
                if (row.type === "Percentage") return "درصدی";
                if (row.type === "Fixed" || row.type === "FixedAmount") return "مبلغ ثابت";
                return String(row.type ?? "");
            },
        },
        {
            header: "مقدار",
            cell: (row: CouponListItemDto) => row.value,
        },
        {
            header: "زمان حذف",
            cell: (row: CouponListItemDto) => {
                return row.deletedAt ? new Date(row.deletedAt).toLocaleString("fa-IR") : "—";
            },
        },
    ];


    return (
        <AdminListPage<CouponListItemDto>
            title="سطل زباله کوپن‌ها"
            basePath="/admin/coupons"
            data={data}
            q={q}
            createButton={<Link
                href="/admin/coupons"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
                ← بازگشت به لیست کوپن‌ها
            </Link>}
            searchPlaceholder="جستجو در سطل زباله..."
            enableStatusFilter={false}
            totalLabel={`${data.totalCount} کوپن ها در سطل زباله`}
            emptyMessage="هیچ کوپنی در سطل زباله نیست."
            rowMenuHeader="عملیات"
            showTrashButton={false}
            rowMenuCell={(row) => <CouponTrashRowMenuCell coupon={row} />}
            columns={columns as any} />
    );
}
