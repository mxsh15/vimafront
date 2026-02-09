"use client";

import DiscountModalButton from "./DiscountModalButton";

export function DiscountCreateButton() {
    return (
        <DiscountModalButton
            asHeader
            triggerVariant="primary"
            label="تخفیف جدید"
        />
    );
}
