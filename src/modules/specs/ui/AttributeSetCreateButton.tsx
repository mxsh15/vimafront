"use client";

import { useState } from "react";
import { AttributeSetModal } from "./AttributeSetModal";

export function AttributeSetCreateButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white"
      >
        + ست جدید
      </button>

      <AttributeSetModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
