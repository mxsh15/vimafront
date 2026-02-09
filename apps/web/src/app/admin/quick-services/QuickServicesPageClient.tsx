"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AdminListPage } from "@/shared/components/AdminListPage";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import type {
    AdminQuickServiceListItem,
    AdminQuickServiceUpsert,
    PagedResult,
} from "@/modules/quickService/types";
import QuickServiceUpsertModal from "@/modules/quickService/ui/QuickServiceUpsertModal";
import { QuickServiceCreateButton } from "@/modules/quickService/ui/QuickServiceCreateButton";
import { QuickServiceRowMenuCell } from "@/modules/quickService/ui/QuickServiceRowMenuCell";
import { createQuickServiceAction } from "@/modules/quickService/actions";

export default function QuickServicesPageClient(props: {
    data: PagedResult<AdminQuickServiceListItem>;
    q: string;
    page: number;
    pageSize: number;
    status: "all" | "active" | "inactive";
}) {
    const router = useRouter();
    const { data, q } = props;

    const [createOpen, setCreateOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const columns = useMemo(
        () => [
            {
                id: "preview",
                header: "آیکن",
                width: "90px",
                cell: (r: AdminQuickServiceListItem) => (
                    <img
                        src={resolveMediaUrl(r.mediaUrl)}
                        alt={r.title}
                        className="h-10 w-10 object-cover rounded-full border border-slate-200 bg-white"
                    />
                ),
                cellClassName: "px-2",
            },
            {
                id: "title",
                header: "عنوان",
                cell: (r: AdminQuickServiceListItem) => (
                    <span className="text-xs font-medium text-slate-900">{r.title}</span>
                ),
                cellClassName: "px-2",
            },
            {
                id: "linkUrl",
                header: "لینک",
                cell: (r: AdminQuickServiceListItem) => (
                    <span className="text-[11px] text-slate-600 break-all">
                        {r.linkUrl ?? "—"}
                    </span>
                ),
                cellClassName: "px-2",
            },
            {
                id: "sortOrder",
                header: "ترتیب",
                width: "90px",
                cell: (r: AdminQuickServiceListItem) => (
                    <span className="text-[11px] text-slate-600">{r.sortOrder}</span>
                ),
                cellClassName: "px-2",
            },
            {
                id: "status",
                header: "وضعیت",
                width: "110px",
                cell: (r: AdminQuickServiceListItem) =>
                    r.isActive ? (
                        <span className="text-[11px] font-medium text-emerald-700">فعال</span>
                    ) : (
                        <span className="text-[11px] text-slate-400">غیرفعال</span>
                    ),
                cellClassName: "px-2",
            },
        ],
        []
    );

    return (
        <>
            <AdminListPage<AdminQuickServiceListItem>
                title="سرویس‌های سریع صفحه اصلی"
                subtitle="تصویر (آیکن/لوگو)، عنوان، لینک و ترتیب نمایش."
                basePath="/admin/quick-services"
                data={data}
                q={q}
                createButton={<QuickServiceCreateButton onClick={() => setCreateOpen(true)} />}
                searchPlaceholder="جستجو در عنوان/لینک..."
                emptyMessage="آیتمی ثبت نشده است."
                rowMenuHeader="عملیات"
                rowMenuCell={(row) => <QuickServiceRowMenuCell row={row} />}
                filterBars={[
                    {
                        paramKey: "status",
                        label: "وضعیت:",
                        options: [
                            { label: "همه", value: null },
                            { label: "فعال", value: "active" },
                            { label: "غیرفعال", value: "inactive" },
                        ],
                    },
                ]}
                columns={columns as any}
            />

            <QuickServiceUpsertModal
                open={createOpen}
                onOpenChange={setCreateOpen}
                initial={null}
                submitting={submitting}
                onSubmit={async (dto: AdminQuickServiceUpsert) => {
                    try {
                        setSubmitting(true);
                        await createQuickServiceAction(dto);
                        setCreateOpen(false);
                        router.refresh();
                    } finally {
                        setSubmitting(false);
                    }
                }}
            />
        </>
    );
}
