"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import type { AdminCartListItemDto } from "../types";
import { restoreAdminCartAction, hardDeleteAdminCartAction } from "../actions";

export function CartTrashRowMenuCell({ cart }: { cart: AdminCartListItemDto }) {
    const router = useRouter();

    return (
        <RowActionsMenu
            editLabel="بازیابی"
            deleteLabel="حذف دائمی"
            onEdit={async () => {
                const ok = window.confirm(`بازیابی سبد خرید «${cart.userFullName}»؟`);
                if (!ok) return;
                await restoreAdminCartAction(cart.id);
                router.refresh();
            }}
            onDelete={async () => {
                const ok = window.confirm(`حذف دائمی سبد خرید «${cart.userFullName}»؟ این عملیات برگشت‌پذیر نیست.`);
                if (!ok) return;
                await hardDeleteAdminCartAction(cart.id);
                router.refresh();
            }}
        />
    );
}
