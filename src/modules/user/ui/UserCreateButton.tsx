"use client";

import { useState } from "react";
import { UserEntityModal } from "./UserEntityModal";
import type { RoleOptionDto } from "../../role/types";
import type { VendorOptionDto } from "../../vendor/types";

export function UserCreateButton({
  roleOptions = [],
  vendorOptions = [],
}: {
  roleOptions?: RoleOptionDto[];
  vendorOptions?: VendorOptionDto[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-700"
      >
        <span className="text-base leading-none">＋</span>
        <span>ایجاد کاربر</span>
      </button>

      <UserEntityModal
        open={open}
        onClose={() => setOpen(false)}
        roleOptions={roleOptions}
        vendorOptions={vendorOptions}
      />
    </>
  );
}

