"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import type { AdminQuickServiceListItem, AdminQuickServiceUpsert } from "../types";
import { deleteQuickServiceAction, updateQuickServiceAction } from "../actions";
import QuickServiceUpsertModal from "./QuickServiceUpsertModal";

export function QuickServiceRowMenuCell({ row }: { row: AdminQuickServiceListItem }) {
    const router = useRouter();
    const [editOpen, setEditOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    return (
        <>
            <RowActionsMenu
                editLabel="ویرایش"
                deleteLabel="حذف آیتم"
                onEdit={() => setEditOpen(true)}
                onDelete={async () => {
                    const ok = window.confirm(`آیا از حذف «${row.title}» مطمئن هستید؟`);
                    if (!ok) return;
                    await deleteQuickServiceAction(row.id);
                    router.refresh();
                }}
            />

            <QuickServiceUpsertModal
                open={editOpen}
                onOpenChange={setEditOpen}
                initial={row}
                submitting={submitting}
                onSubmit={async (dto: AdminQuickServiceUpsert) => {
                    try {
                        setSubmitting(true);
                        await updateQuickServiceAction(row.id, dto);
                        setEditOpen(false);
                        router.refresh();
                    } finally {
                        setSubmitting(false);
                    }
                }}
            />
        </>
    );
}
