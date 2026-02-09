"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import type { AdminAuditLogListItemDto } from "../types";

export function AuditLogRowMenuCell({ row }: { row: AdminAuditLogListItemDto }) {
    const router = useRouter();

    return (
        <RowActionsMenu
            editLabel="مشاهده"
            onEdit={() => router.push(`/admin/audit-logs/${row.id}`)}
        />
    );
}
