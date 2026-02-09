"use client";

import { useState } from "react";
import type { AttributeSetListItemDto } from "../types";
import { AttributeSetModal } from "./AttributeSetModal";


export function AttributeSetRowMenuCell({
  row,
}: {
  row: AttributeSetListItemDto;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-end gap-2 text-[11px]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl border border-slate-200 px-2 py-1 text-slate-600"
        >
          ویرایش
        </button>
      </div>

      <AttributeSetModal
        open={open}
        onClose={() => setOpen(false)}
        setItem={{
          ...row,
          rowVersion: null,
        }}
      />
    </>
  );
}
