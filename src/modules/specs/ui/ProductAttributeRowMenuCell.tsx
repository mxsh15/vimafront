"use client";

import { useState } from "react";
import type { ProductAttributeListItemDto } from "../types";
import { ProductAttributeModal } from "./ProductAttributeModal";
import { AttributeOptionsModal } from "./AttributeOptionsModal";

export function ProductAttributeRowMenuCell({
  attribute,
}: {
  attribute: ProductAttributeListItemDto;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-end gap-2 text-[11px]">
        <button
          type="button"
          onClick={() => setOptionsOpen(true)}
          className="rounded-xl border border-slate-200 px-2 py-1 text-slate-600"
        >
          گزینه‌ها
        </button>
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="rounded-xl border border-slate-200 px-2 py-1 text-slate-600"
        >
          ویرایش
        </button>
      </div>

      <ProductAttributeModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        groupId={attribute.attributeGroupId}
        attribute={attribute}
      />

      <AttributeOptionsModal
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        attributeId={attribute.id}
        attributeName={attribute.name}
      />
    </>
  );
}
