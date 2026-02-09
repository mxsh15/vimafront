"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import type { AdminWishlistListItemDto } from "../types";
import { restoreAdminWishlistAction, hardDeleteAdminWishlistAction } from "../actions";

export function WishlistTrashRowMenuCell({ row }: { row: AdminWishlistListItemDto }) {
    const router = useRouter();

    return (
        <RowActionsMenu
            editLabel="بازیابی"
            deleteLabel="حذف دائمی"
            onEdit={async () => {
                const ok = window.confirm(`بازیابی Wishlist «${row.userFullName}»؟`);
                if (!ok) return;
                await restoreAdminWishlistAction(row.id);
                router.refresh();
            }}
            onDelete={async () => {
                const ok = window.confirm(`حذف دائمی Wishlist «${row.userFullName}»؟ این عملیات برگشت‌پذیر نیست.`);
                if (!ok) return;
                await hardDeleteAdminWishlistAction(row.id);
                router.refresh();
            }}
        />
    );
}
