"use client";

import { useState } from "react";
import { CategoryEditModal } from "./CategoryEditModal";
import { CategoryOptionDto } from "../types";

export function CategoryCreateButton({
  parentOptions,
}: {
  parentOptions: CategoryOptionDto[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-700"
      >
        <span className="text-base leading-none">＋</span>
        <span>ایجاد دسته</span>
      </button>

      <CategoryEditModal
        open={open}
        onClose={() => setOpen(false)}
        parentOptions={parentOptions}
      />
    </>
  );
}
