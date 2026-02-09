"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import { restoreVendorAction, hardDeleteVendorAction } from "../actions";

type VendorTrashRowActionsMenuProps = {
  id: string;
  storeName?: string;
};

export function VendorTrashRowActionsMenu({
  id,
  storeName,
}: VendorTrashRowActionsMenuProps) {
  const router = useRouter();

  return (
    <RowActionsMenu
      editLabel="بازیابی"
      deleteLabel="حذف دائمی"
      onEdit={async () => {
        const ok = window.confirm(
          `آیا از بازیابی فروشنده «${storeName ?? ""}» مطمئن هستید؟`
        );
        if (!ok) return;
        await restoreVendorAction(id);
        router.refresh();
      }}
      onDelete={async () => {
        const ok = window.confirm(
          `آیا از حذف دائمی فروشنده «${storeName ?? ""}» مطمئن هستید؟ این عمل قابل بازگشت نیست.`
        );
        if (!ok) return;
        await hardDeleteVendorAction(id);
        router.refresh();
      }}
    />
  );
}

