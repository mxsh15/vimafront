"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import { restoreRoleAction, hardDeleteRoleAction } from "../actions";

type RoleTrashRowActionsMenuProps = {
  id: string;
  name?: string;
};

export function RoleTrashRowActionsMenu({
  id,
  name,
}: RoleTrashRowActionsMenuProps) {
  const router = useRouter();

  return (
    <RowActionsMenu
      editLabel="بازیابی"
      deleteLabel="حذف دائمی"
      onEdit={async () => {
        const ok = window.confirm(
          `آیا از بازیابی نقش «${name ?? ""}» مطمئن هستید؟`
        );
        if (!ok) return;
        await restoreRoleAction(id);
        router.refresh();
      }}
      onDelete={async () => {
        const ok = window.confirm(
          `آیا از حذف دائمی نقش «${name ?? ""}» مطمئن هستید؟ این عمل قابل بازگشت نیست.`
        );
        if (!ok) return;
        await hardDeleteRoleAction(id);
        router.refresh();
      }}
    />
  );
}

