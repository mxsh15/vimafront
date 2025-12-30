"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import type { AdminReturnListItemDto } from "../types";
import { restoreAdminReturnAction, hardDeleteAdminReturnAction } from "../actions";

export function ReturnTrashRowMenuCell({ row }: { row: AdminReturnListItemDto }) {
    const router = useRouter();

    return (
        <RowActionsMenu
            editLabel="بازیابی"
            deleteLabel="حذف دائمی"
            onEdit={async () => {
                const ok = window.confirm(`بازیابی درخواست «${row.orderNumber}»؟`);
                if (!ok) return;
                await restoreAdminReturnAction(row.id);
                router.refresh();
            }}
            onDelete={async () => {
                const ok = window.confirm(
                    `حذف دائمی درخواست «${row.orderNumber}»؟ این عملیات برگشت‌پذیر نیست.`
                );
                if (!ok) return;
                await hardDeleteAdminReturnAction(row.id);
                router.refresh();
            }}
        />
    );
}
