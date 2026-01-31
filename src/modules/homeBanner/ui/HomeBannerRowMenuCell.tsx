"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import type { AdminHomeBannerListItem, AdminHomeBannerUpsert } from "../types";
import { deleteHomeBannerAction, updateHomeBannerAction } from "../actions";
import HomeBannerUpsertModal from "./HomeBannerUpsertModal";


export function HomeBannerRowMenuCell({ row }: { row: AdminHomeBannerListItem }) {
    const router = useRouter();
    const [editOpen, setEditOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    return (
        <>
            <RowActionsMenu
                editLabel="ویرایش"
                deleteLabel="حذف بنر"
                onEdit={() => setEditOpen(true)}
                onDelete={async () => {
                    const ok = window.confirm(
                        `آیا از حذف بنر «${row.title ?? row.altText ?? ""}» مطمئن هستید؟`
                    );
                    if (!ok) return;
                    await deleteHomeBannerAction(row.id);
                    router.refresh();
                }}
            />

            <HomeBannerUpsertModal
                open={editOpen}
                onOpenChange={setEditOpen}
                initial={row}
                submitting={submitting}
                onSubmit={async (dto: AdminHomeBannerUpsert) => {
                    try {
                        setSubmitting(true);
                        await updateHomeBannerAction(row.id, dto);
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
