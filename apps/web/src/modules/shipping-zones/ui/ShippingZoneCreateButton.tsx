"use client";

import { useState } from "react";
import ShippingZoneUpsertDialog from "./ShippingZoneUpsertDialog";

export function ShippingZoneCreateButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
                ایجاد منطقه ارسال
            </button>

            <ShippingZoneUpsertDialog open={open} onClose={() => setOpen(false)} mode="create" />
        </>
    );
}
