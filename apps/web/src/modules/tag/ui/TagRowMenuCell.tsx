"use client";

import { useState } from "react";
import { TagModal } from "./TagModal";
import type { TagListItemDto } from "../types";
import { deleteTagAction } from "../actions";

export function TagRowMenuCell({ tag }: { tag: TagListItemDto }) {
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    if (!confirm("حذف این برچسب؟")) return;
    await deleteTagAction(tag.id);
  }

  return (
    <>
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => setOpen(true)}
          className="border px-2 py-1 rounded"
        >
          ویرایش
        </button>
        <button
          onClick={handleDelete}
          className="border px-2 py-1 rounded text-red-500"
        >
          حذف
        </button>
      </div>

      {open && (
        <TagModal
          open={open}
          onClose={() => setOpen(false)}
          tag={{
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            createdAtUtc: tag.createdAtUtc,
            updatedAtUtc: tag.updatedAtUtc ?? null,
            isDeleted: tag.isDeleted,
            rowVersion: tag.rowVersion,
          }}
        />
      )}
    </>
  );
}
