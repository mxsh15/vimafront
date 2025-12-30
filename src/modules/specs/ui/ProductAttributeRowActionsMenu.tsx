"use client";

import { useState } from "react";
import type { ProductAttributeListItemDto } from "../types";
import { ProductAttributeModal } from "./ProductAttributeModal";
import { AttributeOptionsModal } from "./AttributeOptionsModal";
import { deleteProductAttributeAction } from "../actions";
import { useRouter } from "next/navigation";

export function ProductAttributeRowActionsMenu({
  attribute,
}: {
  attribute: ProductAttributeListItemDto;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-end gap-2 text-[11px]">
        <button
          type="button"
          onClick={() => setOptionsOpen(true)}
          className="rounded-xl border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-50"
        >
          مقادیر
        </button>

        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="rounded-xl border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-50"
        >
          ویرایش
        </button>

        <button
          type="button"
          onClick={async () => {
            const ok = window.confirm(`ویژگی «${attribute.name}» به سطل زباله منتقل شود؟`);
            if (!ok) return;
            await deleteProductAttributeAction(attribute.id);
            router.refresh();
          }}
          className="rounded-xl border border-rose-200 px-2 py-1 text-rose-600 hover:bg-rose-50"
        >
          حذف
        </button>
      </div>

      <ProductAttributeModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
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
