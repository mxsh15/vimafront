"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import type { AdminShippingAddressListItemDto } from "../types";
import { restoreAdminShippingAddressAction, hardDeleteAdminShippingAddressAction } from "../actions";

export function ShippingAddressTrashRowMenuCell({ row }: { row: AdminShippingAddressListItemDto }) {
    const router = useRouter();

    return (
        <RowActionsMenu
            editLabel="بازیابی"
            deleteLabel="حذف دائمی"
            onEdit={async () => {
                const ok = window.confirm(`بازیابی آدرس «${row.receiverName}»؟`);
                if (!ok) return;
                await restoreAdminShippingAddressAction(row.id);
                router.refresh();
            }}
            onDelete={async () => {
                const ok = window.confirm(`حذف دائمی آدرس «${row.receiverName}»؟ این عملیات برگشت‌پذیر نیست.`);
                if (!ok) return;
                await hardDeleteAdminShippingAddressAction(row.id);
                router.refresh();
            }}
        />
    );
}
