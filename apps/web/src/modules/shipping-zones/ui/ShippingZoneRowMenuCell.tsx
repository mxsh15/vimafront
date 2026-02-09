"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { ShippingZoneListItemDto } from "../types";
import ShippingZoneUpsertDialog from "./ShippingZoneUpsertDialog";
import { deleteShippingZoneAction } from "../actions";

export function ShippingZoneRowMenuCell({ row }: { row: ShippingZoneListItemDto }) {
    const [editOpen, setEditOpen] = useState(false);
    const [pending, startTransition] = useTransition();

    return (
        <div className="flex items-center justify-end gap-2">
            <Link
                href={`/admin/shipping-zones/${row.id}/rates`}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-gray-50"
            >
                نرخ‌ها
            </Link>

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
                        await deleteShippingZoneAction(row.id);
                    })
                }
                className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-gray-50 disabled:opacity-60"
            >
                حذف
            </button>

            <ShippingZoneUpsertDialog open={editOpen} onClose={() => setEditOpen(false)} mode="edit" initial={row} />
        </div>
    );
}
