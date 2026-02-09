"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import { restoreUserAction, hardDeleteUserAction } from "../actions";

type UserTrashRowActionsMenuProps = {
  id: string;
  fullName?: string;
};

export function UserTrashRowActionsMenu({
  id,
  fullName,
}: UserTrashRowActionsMenuProps) {
  const router = useRouter();

  return (
    <RowActionsMenu
      editLabel="بازیابی"
      deleteLabel="حذف دائمی"
      onEdit={async () => {
        const ok = window.confirm(
          `آیا از بازیابی کاربر «${fullName ?? ""}» مطمئن هستید؟`
        );
        if (!ok) return;
        await restoreUserAction(id);
        router.refresh();
      }}
      onDelete={async () => {
        const ok = window.confirm(
          `آیا از حذف دائمی کاربر «${fullName ?? ""}» مطمئن هستید؟ این عمل قابل بازگشت نیست.`
        );
        if (!ok) return;
        await hardDeleteUserAction(id);
        router.refresh();
      }}
    />
  );
}

