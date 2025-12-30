"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import type { ProductAttributeListItemDto } from "../types";
import {
    restoreProductAttributeAction,
    hardDeleteProductAttributeAction,
} from "../actions";

export function SpecAttributeTrashRowMenu({
    attribute,
}: {
    attribute: ProductAttributeListItemDto;
}) {
    const router = useRouter();

    return (
        <RowActionsMenu
            editLabel="بازیابی"
            deleteLabel="حذف دائمی"
            onEdit={async () => {
                const ok = window.confirm(`بازیابی «${attribute.name}»؟`);
                if (!ok) return;
                await restoreProductAttributeAction(attribute.id);
                router.refresh();
            }}
            onDelete={async () => {
                const ok = window.confirm(
                    `حذف دائمی «${attribute.name}»؟ این عملیات برگشت‌پذیر نیست.`
                );
                if (!ok) return;
                await hardDeleteProductAttributeAction(attribute.id);
                router.refresh();
            }}
        />
    );
}
