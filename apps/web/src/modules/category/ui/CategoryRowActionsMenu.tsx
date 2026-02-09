"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import { deleteCategoryAction } from "../actions";
import { CategoryEditModal } from "./CategoryEditModal";
import { CategoryFormModel, CategoryListItemDto, CategoryOptionDto } from "../types";

type Props = {
  category: CategoryListItemDto;
  parentOptions: CategoryOptionDto[];
};

export function CategoryRowActionsMenu({ category, parentOptions }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const formCategory: CategoryFormModel = {
    id: category.id,
    title: category.title,
    slug: category.slug,
    parentId: category.parentId ?? null,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    contentHtml: category.contentHtml ?? null,
    iconUrl: category.iconUrl ?? null,
    seoDescription: category.seoDescription ?? null,
    seoKeywords: category.seoKeywords ?? null,
    seoTitle: category.seoTitle ?? null,
  };

  return (
    <>
      <RowActionsMenu
        editLabel="ویرایش"
        deleteLabel="حذف دسته"
        onEdit={() => setOpen(true)}
        onDelete={async () => {
          const ok = window.confirm(
            `آیا از حذف دسته «${category.title}» مطمئن هستید؟`
          );
          if (!ok) return;
          await deleteCategoryAction(category.id);
          router.refresh();
        }}
      />

      <CategoryEditModal
        open={open}
        onClose={() => setOpen(false)}
        category={formCategory}
        parentOptions={parentOptions}
      />
    </>
  );
}
