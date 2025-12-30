"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import { restoreCategory, hardDeleteCategory } from "../actions";
import { CategoryListItemDto } from "../types";


export function CategoryTrashRowActionsMenu({
  category,
}: {
  category: CategoryListItemDto;
}) {
  const router = useRouter();

  return (
    <RowActionsMenu
      editLabel="بازیابی"
      deleteLabel="حذف دائمی"
      onEdit={async () => {
        const ok = window.confirm(
          `آیا از بازیابی دسته «${category.title}» مطمئن هستید؟`
        );
        if (!ok) return;
        await restoreCategory(category.id);
        router.refresh();
      }}
      onDelete={async () => {
        const ok = window.confirm(
          `آیا از حذف دائمی دسته «${category.title}» مطمئن هستید؟ این عملیات قابل برگشت نیست.`
        );
        if (!ok) return;
        await hardDeleteCategory(category.id);
        router.refresh();
      }}
    />
  );
}
