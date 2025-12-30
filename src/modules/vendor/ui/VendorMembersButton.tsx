"use client";

import { useState } from "react";
import type { UserOptionDto } from "@/modules/user/types";
import { VendorMembersModal } from "./VendorMembersModal";

type VendorMembersButtonProps = {
    vendorId: string;
    vendorName: string;
    userOptions: UserOptionDto[];
};

export function VendorMembersButton({
    vendorId,
    vendorName,
    userOptions,
}: VendorMembersButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-xl border border-slate-200 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
            >
                مدیریت اعضا
            </button>

            {open && (
                <VendorMembersModal
                    open={open}
                    onClose={() => setOpen(false)}
                    vendorId={vendorId}
                    vendorName={vendorName}
                    userOptions={userOptions}
                />
            )}
        </>
    );
}
