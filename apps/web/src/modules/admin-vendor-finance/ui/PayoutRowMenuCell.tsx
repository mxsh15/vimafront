"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import type { AdminVendorPayoutListItemDto } from "../types";
import { deletePayoutAction } from "../actions";

export function PayoutRowMenuCell({ row }: { row: AdminVendorPayoutListItemDto }) {
    const router = useRouter();

    return (
        <RowActionsMenu
            editLabel="مشاهده"
            deleteLabel="حذف"
            onEdit={() => router.push(`/admin/vendor-finance/payouts/${row.id}`)}
            onDelete={async () => {
                const ok = window.confirm(`درخواست تسویه «${row.storeName}» حذف شود؟`);
                if (!ok) return;
                await deletePayoutAction(row.id);
                router.refresh();
            }}
        />
    );
}
