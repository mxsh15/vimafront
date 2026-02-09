"use client";

import { useState } from "react";
import type {
  AttributeSetOptionDto,
  ProductAttributeOptionDto,
} from "../types";
import { AttributeGroupModal } from "./AttributeGroupModal";

export function AttributeGroupsCreateButton({
  attributeSetOptions,
  attributeOptions,
}: {
  attributeSetOptions: AttributeSetOptionDto[];
  attributeOptions: ProductAttributeOptionDto[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white"
      >
        + افزودن گروه ویژگی
      </button>

      <AttributeGroupModal
        open={open}
        onClose={() => setOpen(false)}
        attributeSetOptions={attributeSetOptions}
        attributeOptions={attributeOptions}
      />
    </>
  );
}
