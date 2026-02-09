"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import type { AdminVendorOfferListItemDto } from "../types";
import { restoreOfferAction, hardDeleteOfferAction } from "../actions";

export function OfferTrashRowMenuCell({ row }: { row: AdminVendorOfferListItemDto }) {
    const router = useRouter();
    const title = `«${row.vendorName}» برای «${row.productTitle}»`;

    return (
        <RowActionsMenu
            editLabel="بازیابی"
            deleteLabel="حذف دائمی"
            onEdit={async () => {
                const ok = window.confirm(`بازیابی پیشنهاد ${title}؟`);
                if (!ok) return;
                await restoreOfferAction(row.id);
                router.refresh();
            }}
            onDelete={async () => {
                const ok = window.confirm(`حذف دائمی پیشنهاد ${title}؟ این عملیات برگشت‌پذیر نیست.`);
                if (!ok) return;
                await hardDeleteOfferAction(row.id);
                router.refresh();
            }}
            extraActions={[
                {
                    label: "جزئیات",
                    onClick: async () => {
                        router.push(`/admin/vendor-offers/${row.id}`);
                    },
                },
            ]}

        />
    );
}
