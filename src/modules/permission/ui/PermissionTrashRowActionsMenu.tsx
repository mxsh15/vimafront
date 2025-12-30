"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import { restorePermissionAction, hardDeletePermissionAction } from "../actions";

type PermissionTrashRowActionsMenuProps = {
  id: string;
  name?: string;
};

export function PermissionTrashRowActionsMenu({
  id,
  name,
}: PermissionTrashRowActionsMenuProps) {
  const router = useRouter();

  return (
    <RowActionsMenu
      editLabel="بازیابی"
      deleteLabel="حذف دائمی"
      onEdit={async () => {
        const ok = window.confirm(
          `آیا از بازیابی دسترسی «${name ?? ""}» مطمئن هستید؟`
        );
        if (!ok) return;
        await restorePermissionAction(id);
        router.refresh();
      }}
      onDelete={async () => {
        const ok = window.confirm(
          `آیا از حذف دائمی دسترسی «${name ?? ""}» مطمئن هستید؟ این عمل قابل بازگشت نیست.`
        );
        if (!ok) return;
        await hardDeletePermissionAction(id);
        router.refresh();
      }}
    />
  );
}

