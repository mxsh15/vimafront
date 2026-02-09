"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import type { AdminWishlistListItemDto } from "../types";
import { deleteAdminWishlistAction } from "../actions";

export function WishlistRowMenuCell({ row }: { row: AdminWishlistListItemDto }) {
    const router = useRouter();

    return (
        <RowActionsMenu
            editLabel="مشاهده"
            deleteLabel="حذف"
            onEdit={() => router.push(`/admin/wishlists/${row.id}`)}
            onDelete={async () => {
                const ok = window.confirm(`Wishlist کاربر «${row.userFullName}» حذف شود؟`);
                if (!ok) return;
                await deleteAdminWishlistAction(row.id);
                router.refresh();
            }}
        />
    );
}
