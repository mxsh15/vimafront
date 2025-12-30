"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import { restoreCouponAction, hardDeleteCouponAction } from "../actions";
import type { CouponListItemDto } from "../types";

export function CouponTrashRowMenuCell({
    coupon,
}: {
    coupon: CouponListItemDto;
}) {
    const router = useRouter();

    return (
        <RowActionsMenu
            editLabel="بازیابی"
            deleteLabel="حذف دائمی"
            onEdit={async () => {
                const ok = window.confirm(
                    `آیا از بازیابی کوپن «${coupon.title ?? coupon.code}» مطمئن هستید؟`
                );
                if (!ok) return;

                await restoreCouponAction(coupon.id);
                router.refresh();
            }}
            onDelete={async () => {
                const ok = window.confirm(
                    `آیا از حذف دائمی کوپن «${coupon.title ?? coupon.code}» مطمئن هستید؟ این عملیات قابل برگشت نیست.`
                );
                if (!ok) return;

                await hardDeleteCouponAction(coupon.id);
                router.refresh();
            }}
        />
    );
}
