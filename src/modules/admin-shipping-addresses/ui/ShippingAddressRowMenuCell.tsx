"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import type { AdminShippingAddressListItemDto } from "../types";
import { deleteAdminShippingAddressAction } from "../actions";

export function ShippingAddressRowMenuCell({ row }: { row: AdminShippingAddressListItemDto }) {
    const router = useRouter();

    return (
        <RowActionsMenu
            editLabel="مشاهده"
            deleteLabel="حذف"
            onEdit={() => router.push(`/admin/shipping-addresses/${row.id}`)}
            onDelete={async () => {
                const ok = window.confirm(`حذف آدرس گیرنده «${row.receiverName}»؟`);
                if (!ok) return;
                await deleteAdminShippingAddressAction(row.id);
                router.refresh();
            }}
        />
    );
}
