"use client";

import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import { restoreTagAction, hardDeleteTagAction } from "../actions";
import { useRouter } from "next/navigation";

export function TagTrashRowActionsMenu({
  id,
  name,
}: {
  id: string;
  name?: string;
}) {
  const router = useRouter();

  return (
    <RowActionsMenu
      editLabel="بازیابی"
      deleteLabel="حذف دائمی"
      onEdit={async () => {
        if (!confirm(`بازیابی «${name ?? ""}»؟`)) return;
        await restoreTagAction(id);
        router.refresh();
      }}
      onDelete={async () => {
        if (!confirm(`حذف قطعی «${name ?? ""}»؟ عملیات غیرقابل بازگشت است.`))
          return;
        await hardDeleteTagAction(id);
        router.refresh();
      }}
    />
  );
}
