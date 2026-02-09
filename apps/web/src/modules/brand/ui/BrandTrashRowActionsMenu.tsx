"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import { restoreBrandAction, hardDeleteBrandAction } from "../actions";

type BrandTrashRowActionsMenuProps = {
  id: string;
  title?: string;
};

export function BrandTrashRowActionsMenu({
  id,
  title,
}: BrandTrashRowActionsMenuProps) {
  const router = useRouter();

  return (
    <RowActionsMenu
      editLabel="بازیابی"
      deleteLabel="حذف دائمی"
      onEdit={async () => {
        const ok = window.confirm(
          `آیا از بازیابی برند «${title ?? ""}» مطمئن هستید؟`
        );
        if (!ok) return;
        await restoreBrandAction(id);
        router.refresh();
      }}
      onDelete={async () => {
        const ok = window.confirm(
          `آیا از حذف دائمی برند «${title ?? ""}» مطمئن هستید؟ این عمل قابل بازگشت نیست.`
        );
        if (!ok) return;
        await hardDeleteBrandAction(id);
        router.refresh();
      }}
    />
  );
}
