"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import { restoreProductAction, hardDeleteProductAction } from "../actions";

type ProductTrashRowActionsMenuProps = {
  id: string;
  title?: string;
};

export function ProductTrashRowActionsMenu({
  id,
  title,
}: ProductTrashRowActionsMenuProps) {
  const router = useRouter();

  return (
    <RowActionsMenu
      editLabel="بازیابی"
      deleteLabel="حذف دائمی"
      onEdit={async () => {
        const ok = window.confirm(
          `آیا از بازیابی محصول «${title ?? ""}» مطمئن هستید؟`
        );
        if (!ok) return;
        await restoreProductAction(id);
        router.refresh();
      }}
      onDelete={async () => {
        const ok = window.confirm(
          `آیا از حذف دائمی محصول «${title ?? ""}» مطمئن هستید؟ این عمل قابل بازگشت نیست.`
        );
        if (!ok) return;
        await hardDeleteProductAction(id);
        router.refresh();
      }}
    />
  );
}

