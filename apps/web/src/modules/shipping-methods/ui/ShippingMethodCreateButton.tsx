"use client";

import { useState } from "react";
import ShippingMethodUpsertDialog from "./ShippingMethodUpsertDialog";

export function ShippingMethodCreateButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
                ایجاد روش ارسال
            </button>

            <ShippingMethodUpsertDialog open={open} onClose={() => setOpen(false)} mode="create" />
        </>
    );
}
