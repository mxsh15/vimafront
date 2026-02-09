"use client";
import { useState } from "react";
import Link from "next/link";
import { AttributeGroupModal } from "./AttributeGroupModal";
import { deleteAttributeGroupAction } from "../actions";
import type {
  AttributeGroupListItemDto,
  AttributeSetOptionDto,
  ProductAttributeOptionDto,
} from "../types";

export function AttributeGroupsRowMenuCell({
  row,
  attributeSetOptions,
  attributeOptions,
}: {
  row: AttributeGroupListItemDto;
  attributeSetOptions: AttributeSetOptionDto[];
  attributeOptions: ProductAttributeOptionDto[];
}) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("آیا از حذف این گروه مطمئن هستید؟")) return;
    setDeleting(true);
    await deleteAttributeGroupAction(row.id);
    setDeleting(false);
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2 text-[11px]">
        <Link
          href={`/admin/spec-groups/${row.id}`}
          className="rounded-xl border border-slate-200 px-2 py-1 text-slate-600"
        >
          ویژگی‌ها
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl border border-slate-200 px-2 py-1 text-slate-600"
        >
          ویرایش
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-xl border border-red-200 px-2 py-1 text-red-500 disabled:opacity-60"
        >
          {deleting ? "..." : "حذف"}
        </button>
      </div>

      <AttributeGroupModal
        open={open}
        onClose={() => setOpen(false)}
        attributeSetOptions={attributeSetOptions}
        attributeOptions={attributeOptions}
        group={{
          id: row.id,
          attributeSetId: row.attributeSetId,
          attributeSetName: row.attributeSetName,
          name: row.name,
          sortOrder: row.sortOrder,
          createdAtUtc: "",
          updatedAtUtc: null,
          isDeleted: false,
          rowVersion: "",
          attributeIds: row.attributeIds ?? [],
        }}
      />
    </>
  );
}
