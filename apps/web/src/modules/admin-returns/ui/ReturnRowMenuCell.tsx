"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import type { AdminReturnListItemDto } from "../types";
import { deleteAdminReturnAction } from "../actions";

export function ReturnRowMenuCell({ row }: { row: AdminReturnListItemDto }) {
    const router = useRouter();

    return (
        <RowActionsMenu
            editLabel="مشاهده"
            deleteLabel="حذف"
            onEdit={() => router.push(`/admin/returns/${row.id}`)}
            onDelete={async () => {
                const ok = window.confirm(`درخواست مرجوعی «${row.orderNumber}» حذف شود؟`);
                if (!ok) return;
                await deleteAdminReturnAction(row.id);
                router.refresh();
            }}
        />
    );
}
