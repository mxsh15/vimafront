"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import type { AdminVendorOfferListItemDto } from "../types";
import {
    approveOfferAction,
    rejectOfferAction,
    disableOfferAction,
    enableOfferAction,
    deleteOfferAction,
} from "../actions";

export function OfferRowMenuCell({ row }: { row: AdminVendorOfferListItemDto }) {
    const router = useRouter();

    const confirmTitle = `«${row.vendorName}» برای «${row.productTitle}»`;

    const canEnable = row.status === "Disabled";
    const canApprove = row.status !== "Approved";
    const canReject = row.status !== "Rejected";
    const canDisable = row.status !== "Disabled";

    return (
        <RowActionsMenu
            editLabel={canEnable ? "فعال‌سازی" : "تایید"}
            deleteLabel="حذف"
            onEdit={async () => {
                if (canEnable) {
                    const ok = window.confirm(`فعال‌سازی پیشنهاد ${confirmTitle}؟`);
                    if (!ok) return;
                    await enableOfferAction(row.id);
                    router.refresh();
                    return;
                }

                const ok = window.confirm(`تایید پیشنهاد ${confirmTitle}؟`);
                if (!ok) return;
                await approveOfferAction(row.id);
                router.refresh();
            }}
            onDelete={async () => {
                const ok = window.confirm(`حذف پیشنهاد ${confirmTitle}؟`);
                if (!ok) return;
                await deleteOfferAction(row.id);
                router.refresh();
            }}
            extraActions={[
                {
                    label: "جزئیات",
                    onClick: async () => {
                        router.push(`/admin/vendor-offers/${row.id}`);
                    },
                },
                {
                    label: "رد",
                    disabled: !canReject,
                    danger: true,
                    onClick: async () => {
                        const notes = window.prompt("علت رد (اختیاری):") ?? undefined;
                        const ok = window.confirm(`رد پیشنهاد ${confirmTitle}؟`);
                        if (!ok) return;
                        await rejectOfferAction(row.id, notes);
                        router.refresh();
                    },
                },
                {
                    label: "غیرفعال",
                    disabled: !canDisable,
                    danger: true,
                    onClick: async () => {
                        const notes = window.prompt("علت غیرفعال‌سازی (اختیاری):") ?? undefined;
                        const ok = window.confirm(`غیرفعال شود؟ ${confirmTitle}`);
                        if (!ok) return;
                        await disableOfferAction(row.id, notes);
                        router.refresh();
                    },
                },
                {
                    label: "بازگشت به Pending",
                    disabled: row.status === "Pending",
                    onClick: async () => {
                        const notes = window.prompt("یادداشت (اختیاری):") ?? undefined;
                        const ok = window.confirm(`به وضعیت Pending برگردد؟ ${confirmTitle}`);
                        if (!ok) return;
                        await enableOfferAction(row.id, notes); // enable = Pending طبق بک‌اندی که قبلاً نوشتم
                        router.refresh();
                    },
                },
            ]}
        />
    );
}
