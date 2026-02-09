import { AdminListPage } from "@/shared/components/AdminListPage";
import type { ProductAttributeListItemDto } from "@/modules/specs/types";
import { listDeletedProductAttributes } from "@/modules/specs/api";
import { SpecAttributeTrashRowMenu } from "@/modules/specs/ui/SpecAttributeTrashRowMenu";
import Link from "next/link";

export const metadata = { title: "سطل زباله ویژگی‌ها | پنل مدیریت" };

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string }>;
}) {
    const params = await searchParams;
    const page = Number(params.page ?? "1");
    const q = params.q ?? "";
    const pageSize = 20;

    const data = await listDeletedProductAttributes({ page, pageSize, q });

    return (
        <AdminListPage<ProductAttributeListItemDto>
            title="سطل زباله ویژگی‌ها"
            subtitle="بازیابی یا حذف دائمی ویژگی‌ها"
            basePath="/admin/spec-attributes/trash"
            data={data}
            q={q}
            createButton={<Link
                href="/admin/spec-attributes"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
                ← بازگشت به لیست ویژگی های محصول
            </Link>}
            searchPlaceholder="جستجو..."
            showTrashButton={false}
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => <SpecAttributeTrashRowMenu attribute={row} />}
            columns={[
                { id: "name", header: "نام", cell: (r) => <span className="font-medium">{r.name}</span> },
                { id: "key", header: "نامک", cell: (r) => <span className="font-mono text-xs text-slate-500">{r.key}</span> },
                { id: "sortOrder", header: "ترتیب", cell: (r) => <span className="text-[11px] text-slate-400">{r.sortOrder}</span> },
            ]}
        />
    );
}
