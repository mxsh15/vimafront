"use client";

import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import type { CouponDto, CouponListItemDto } from "../types";
import { deleteCouponAction } from "../actions";
import CouponModalButton from "./CouponModalButton";
import { useState } from "react";
import { clientGetCoupon } from "../api.client";

export function CouponRowMenuCell({ row }: { row: CouponListItemDto }) {
    const [coupon, setCoupon] = useState<CouponDto | null>(null);
    const [open, setOpen] = useState(false);

    const handleEdit = async () => {
        const data = await clientGetCoupon(row.id);
        setCoupon(data);
        setOpen(true);
    };

    return (
        <>
            <RowActionsMenu
                onEdit={handleEdit}
                onDelete={async () => {
                    if (!confirm(`حذف کوپن «${row.title}»؟`)) return;
                    await deleteCouponAction(row.id);
                }}
            />

            <CouponModalButton
                coupon={coupon}
                open={open}
                onOpenChange={setOpen}
                hideTrigger
            />
        </>
    );
}
