"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import type { AdminNotificationListItemDto } from "../types";
import {
    deleteNotificationAction,
    markNotificationReadAction,
    markNotificationUnreadAction,
} from "../actions";

export function NotificationRowMenuCell({ row }: { row: AdminNotificationListItemDto }) {
    const router = useRouter();

    return (
        <RowActionsMenu
            editLabel={row.isRead ? "علامت‌گذاری خوانده نشده" : "علامت‌گذاری خوانده"}
            deleteLabel="حذف"
            onEdit={async () => {
                const ok = window.confirm(
                    row.isRead ? "خوانده نشده شود؟" : "خوانده شود؟"
                );
                if (!ok) return;

                if (row.isRead) await markNotificationUnreadAction(row.id);
                else await markNotificationReadAction(row.id);

                router.refresh();
            }}
            onDelete={async () => {
                const ok = window.confirm(`اعلان «${row.title}» حذف شود؟`);
                if (!ok) return;
                await deleteNotificationAction(row.id);
                router.refresh();
            }}
        />
    );
}
