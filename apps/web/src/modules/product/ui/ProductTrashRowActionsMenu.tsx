"use client";

import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import { restoreProductAction, hardDeleteProductAction } from "../actions";
import { useServerActionMutation } from "@/lib/react-query/use-server-action-mutation";

type ProductTrashRowActionsMenuProps = {
  id: string;
  title?: string;
};

export function ProductTrashRowActionsMenu({
  id,
  title,
}: ProductTrashRowActionsMenuProps) {
  const restore = useServerActionMutation<string, void>({
    action: restoreProductAction,
    invalidate: [["products"] as const, ["products", "trash"] as const],
  });

  const hard = useServerActionMutation<string, void>({
    action: hardDeleteProductAction,
    invalidate: [["products", "trash"] as const],
  });

  return (
    <RowActionsMenu
      editLabel="بازیابی"
      deleteLabel="حذف دائمی"
      onEdit={async () => {
        const ok = window.confirm(
          `آیا از بازیابی محصول «${title ?? ""}» مطمئن هستید؟`
        );
        if (!ok) return;
        await restore.mutateAsync(id);
      }}
      onDelete={async () => {
        const ok = window.confirm(
          `آیا از حذف دائمی محصول «${
            title ?? ""
          }» مطمئن هستید؟ این عمل قابل بازگشت نیست.`
        );
        if (!ok) return;
        await hard.mutateAsync(id);
      }}
    />
  );
}
