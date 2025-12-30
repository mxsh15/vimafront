"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import type { AdminCartListItemDto } from "../types";
import { deleteAdminCartAction } from "../actions";

export function CartRowMenuCell({ row }: { row: AdminCartListItemDto }) {
    const router = useRouter();

    return (
        <RowActionsMenu
            editLabel="مشاهده"
            deleteLabel="حذف"
            onEdit={() => router.push(`/admin/carts/${row.id}`)}
            onDelete={async () => {
                const ok = window.confirm(`حذف سبد خرید کاربر «${row.userFullName}»؟`);
                if (!ok) return;
                await deleteAdminCartAction(row.id);
                router.refresh();
            }}
        />
    );
}
