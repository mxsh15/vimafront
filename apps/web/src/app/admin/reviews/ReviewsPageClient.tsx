"use client";

import { AdminListPage } from "@/shared/components/AdminListPage";
import { PermissionGuard } from "@/shared/components/PermissionGuard";
import type { PagedResult } from "@/shared/types/adminlistpageTypes";
import type { ReviewRow } from "@/modules/review/types";
import { ReviewRowActionsMenu } from "@/modules/review/ui/ReviewRowActionsMenu";
import { usePermissions } from "@/context/PermissionContext";

type ReviewsPageClientProps = {
    data: PagedResult<ReviewRow>;
    q: string;
};

export function ReviewsPageClient({ data, q }: ReviewsPageClientProps) {
    const { hasPermission } = usePermissions();

    return (
        <AdminListPage<ReviewRow>
            title="دیدگاه‌های محصولات"
            subtitle="مدیریت و تأیید نظرات ثبت‌شده توسط کاربران"
            basePath="/admin/reviews"
            data={data}
            q={q}
            createButton={null}
            emptyMessage="تاکنون هیچ دیدگاهی ثبت نشده است."
            rowMenuHeader="عملیات"
            rowMenuCell={(row) =>
                hasPermission("reviews.view") ? (
                    <PermissionGuard permission="reviews.view">
                        <ReviewRowActionsMenu review={row} />
                    </PermissionGuard>
                ) : null
            }
            showTrashButton={false}
            columns={[
                {
                    id: "product",
                    header: "محصول",
                    cell: (r) => r.productTitle,
                    cellClassName: "px-2 text-xs",
                },
                {
                    id: "user",
                    header: "کاربر",
                    cell: (r) => r.userFullName,
                    cellClassName: "px-2 text-xs",
                },
                {
                    id: "rating",
                    header: "امتیاز",
                    cell: (r) => `★ ${r.rating}`,
                    cellClassName: "px-2 text-xs text-amber-500",
                },
                {
                    id: "title",
                    header: "عنوان",
                    cell: (r) => r.title ?? "—",
                    cellClassName: "px-2 text-xs",
                },
                {
                    id: "comment",
                    header: "متن دیدگاه",
                    cell: (r) =>
                        r.comment && r.comment.length > 80
                            ? r.comment.slice(0, 80) + "…"
                            : r.comment ?? "—",
                    cellClassName: "px-2 text-xs text-slate-600",
                },
                {
                    id: "status",
                    header: "وضعیت",
                    cell: (r) => (
                        <span
                            className={
                                "inline-flex rounded-full border px-2 py-0.5 text-[10px] " +
                                (r.isApproved
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                                    : "border-amber-200 bg-amber-50 text-amber-600")
                            }
                        >
                            {r.isApproved ? "تأیید شده" : "در انتظار تأیید"}
                        </span>
                    ),
                    cellClassName: "px-2",
                },
                {
                    id: "createdAt",
                    header: "تاریخ",
                    cell: (r) =>
                        new Date(r.createdAtUtc).toLocaleString("fa-IR", {
                            dateStyle: "short",
                            timeStyle: "short",
                        }),
                    cellClassName: "px-2 text-[11px] text-slate-400",
                },
            ]}
        />
    );
}
