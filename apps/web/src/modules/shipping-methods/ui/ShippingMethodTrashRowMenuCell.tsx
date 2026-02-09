"use client";

import { useTransition } from "react";
import type { ShippingMethodListItemDto } from "../types";
import { restoreShippingMethodAction, hardDeleteShippingMethodAction } from "../actions";

export function ShippingMethodTrashRowMenuCell({ row }: { row: ShippingMethodListItemDto }) {
    const [pending, startTransition] = useTransition();

    return (
        <div className="flex items-center justify-end gap-2">
            <button
                type="button"
                disabled={pending}
                onClick={() => startTransition(async () => restoreShippingMethodAction(row.id))}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-gray-50 disabled:opacity-60"
            >
                بازگردانی
            </button>

            <button
                type="button"
                disabled={pending}
                onClick={() => startTransition(async () => hardDeleteShippingMethodAction(row.id))}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-gray-50 disabled:opacity-60"
            >
                حذف دائمی
            </button>
        </div>
    );
}
