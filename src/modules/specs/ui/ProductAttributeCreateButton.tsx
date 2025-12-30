"use client";

import { useState } from "react";
import { ProductAttributeModal } from "./ProductAttributeModal";

export function ProductAttributeCreateButton({ groupId }: { groupId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-700"
      >
        + ویژگی جدید
      </button>

      <ProductAttributeModal
        open={open}
        onClose={() => setOpen(false)}
        groupId={groupId}
      />
    </>
  );
}
