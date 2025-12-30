"use client";

import { useState } from "react";
import { VendorEntityModal } from "./VendorEntityModal";
import { UserOptionDto } from "@/modules/user/types";

type VendorCreateButtonProps = {
  userOptions: UserOptionDto[];
};

export function VendorCreateButton({ userOptions }: VendorCreateButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-700"
      >
        <span className="text-base leading-none">＋</span>
        <span>ایجاد فروشنده</span>
      </button>

      <VendorEntityModal
        open={open}
        onClose={() => setOpen(false)}
        userOptions={userOptions}
      />
    </>
  );
}

