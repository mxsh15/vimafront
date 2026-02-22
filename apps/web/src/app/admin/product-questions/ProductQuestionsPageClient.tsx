"use client";

import { AdminListPage } from "@/shared/components/AdminListPage";
import type { PagedResult } from "@/shared/types/adminlistpageTypes";
import type { ProductQuestionRow } from "@/modules/product-qa/types";
import { ProductQuestionRowActionsMenu } from "@/modules/product-qa/ui/ProductQuestionRowActionsMenu";
import { PermissionGuard } from "@/shared/components/PermissionGuard";
import { usePermissions } from "@/context/PermissionContext";

type Props = {
    data: PagedResult<ProductQuestionRow>;
    q: string;
};

export function ProductQuestionsPageClient({ data, q }: Props) {
    const { hasPermission } = usePermissions();

    return (
        <AdminListPage<ProductQuestionRow>
            title="سؤالات محصولات"
            subtitle="سؤالات کاربران درباره محصولات و پاسخ‌های مدیریت"
            basePath="/admin/product-questions"
            data={data}
            q={q}
            createButton={null}
            emptyMessage="سؤالی ثبت نشده است."
            rowMenuHeader="عملیات"
            rowMenuCell={(row) =>
                hasPermission("product-questions.view") ? (
                    <PermissionGuard permission="product-questions.view">
                        <ProductQuestionRowActionsMenu question={row} />
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
                    id: "question",
                    header: "سؤال",
                    cell: (r) =>
                        r.question.length > 80 ? r.question.slice(0, 80) + "…" : r.question,
                    cellClassName: "px-2 text-xs text-slate-700",
                },
                {
                    id: "user",
                    header: "کاربر",
                    cell: (r) => r.userFullName,
                    cellClassName: "px-2 text-xs",
                },
                {
                    id: "answersCount",
                    header: "تعداد پاسخ",
                    cell: (r) => r.answersCount,
                    cellClassName: "px-2 text-center text-xs",
                },
                {
                    id: "status",
                    header: "وضعیت پاسخ",
                    cell: (r) => (
                        <span
                            className={
                                "inline-flex rounded-full border px-2 py-0.5 text-[10px] " +
                                (r.isAnswered
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                                    : "border-amber-200 bg-amber-50 text-amber-600")
                            }
                        >
                            {r.isAnswered ? "پاسخ داده شده" : "در انتظار پاسخ"}
                        </span>
                    ),
                    cellClassName: "px-2",
                },
                {
                    id: "approval",
                    header: "وضعیت تأیید",
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
