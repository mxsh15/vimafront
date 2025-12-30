"use client";

import { useState, useTransition } from "react";
import type { ShippingMethodListItemDto } from "../types";
import ShippingMethodUpsertDialog from "./ShippingMethodUpsertDialog";
import { deleteShippingMethodAction } from "../actions";

export function ShippingMethodRowMenuCell({ row }: { row: ShippingMethodListItemDto }) {
    const [editOpen, setEditOpen] = useState(false);
    const [pending, startTransition] = useTransition();

    return (
        <div className="flex items-center justify-end gap-2">
            <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-gray-50"
            >
                ویرایش
            </button>

            <button
                type="button"
                disabled={pending}
                onClick={() =>
                    startTransition(async () => {
                        await deleteShippingMethodAction(row.id);
                    })
                }
                className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-gray-50 disabled:opacity-60"
            >
                حذف
            </button>

            <ShippingMethodUpsertDialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                mode="edit"
                initial={row}
            />
        </div>
    );
}
