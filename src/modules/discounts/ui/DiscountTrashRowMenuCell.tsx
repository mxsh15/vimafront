"use client";

import { useRouter } from "next/navigation";
import type { DiscountListItemDto } from "../types";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import { restoreDiscountAction, hardDeleteDiscountAction } from "../actions";

export function DiscountTrashRowMenuCell({
    discount,
}: {
    discount: DiscountListItemDto;
}) {
    const router = useRouter();

    return (
        <RowActionsMenu
            editLabel="بازیابی"
            deleteLabel="حذف دائمی"
            onEdit={async () => {
                const ok = window.confirm(
                    `آیا از بازیابی کوپن «${discount.title ?? discount.code}» مطمئن هستید؟`
                );
                if (!ok) return;

                await restoreDiscountAction(discount.id);
                router.refresh();
            }}
            onDelete={async () => {
                const ok = window.confirm(
                    `آیا از حذف دائمی کوپن «${discount.title ?? discount.code}» مطمئن هستید؟ این عملیات قابل برگشت نیست.`
                );
                if (!ok) return;

                await hardDeleteDiscountAction(discount.id);
                router.refresh();
            }}
        />
    );
}
