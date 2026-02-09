"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import type { AdminVendorPayoutListItemDto } from "../types";
import { restorePayoutAction, hardDeletePayoutAction } from "../actions";

export function PayoutTrashRowMenuCell({ row }: { row: AdminVendorPayoutListItemDto }) {
    const router = useRouter();

    return (
        <RowActionsMenu
            editLabel="بازیابی"
            deleteLabel="حذف دائمی"
            onEdit={async () => {
                const ok = window.confirm(`بازیابی درخواست تسویه «${row.storeName}»؟`);
                if (!ok) return;
                await restorePayoutAction(row.id);
                router.refresh();
            }}
            onDelete={async () => {
                const ok = window.confirm(`حذف دائمی درخواست تسویه «${row.storeName}»؟ این عملیات برگشت‌پذیر نیست.`);
                if (!ok) return;
                await hardDeletePayoutAction(row.id);
                router.refresh();
            }}
        />
    );
}
