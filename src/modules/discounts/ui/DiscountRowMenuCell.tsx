"use client";

import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import type { DiscountDto, DiscountListItemDto } from "../types";
import { deleteDiscountAction } from "../actions";
import DiscountModalButton from "./DiscountModalButton";
import { useState } from "react";
import { clientGetDiscount } from "../api-client";

export function DiscountRowMenuCell({ row }: { row: DiscountListItemDto }) {
  const [discount, setDiscount] = useState<DiscountDto | null>(null);
  const [open, setOpen] = useState(false);

  const handleEdit = async () => {
    const data = await clientGetDiscount(row.id);
    setDiscount(data);
    setOpen(true);
  };

  return (
    <>
      <RowActionsMenu
        onEdit={handleEdit}
        onDelete={async () => {
          if (!confirm(`حذف تخفیف «${row.title}»؟`)) return;
          await deleteDiscountAction(row.id);
        }}
      />

      <DiscountModalButton
        discount={discount}
        open={open}
        onOpenChange={setOpen}
        hideTrigger
      />
    </>
  );
}
