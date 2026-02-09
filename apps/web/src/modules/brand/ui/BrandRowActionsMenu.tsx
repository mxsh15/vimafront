"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import { deleteBrandAction } from "@/modules/brand/actions";
import { BrandEntityModal } from "./BrandEntityModal";
import { usePermissions } from "@/context/PermissionContext";

type BrandRowActionsMenuProps = {
  brand: {
    id: string;
    title: string;
    slug: string;
    logoUrl?: string | null;
  };
};

export function BrandRowActionsMenu({ brand }: BrandRowActionsMenuProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const { hasPermission } = usePermissions();

  const canEdit = hasPermission("brands.update");
  const canDelete = hasPermission("brands.delete");

  if (!canEdit && !canDelete) {
    return null;
  }

  return (
    <>
      <RowActionsMenu
        editLabel="ویرایش"
        deleteLabel="حذف برند"
        onEdit={canEdit ? () => setEditOpen(true) : undefined}
        onDelete={
          canDelete
            ? async () => {
                const ok = window.confirm(
                  `آیا از حذف برند «${brand.title ?? ""}» مطمئن هستید؟`
                );
                if (!ok) return;
                await deleteBrandAction(brand.id);
                router.refresh();
              }
            : undefined
        }
      />

      {canEdit && (
        <BrandEntityModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          brand={brand as any}
        />
      )}
    </>
  );
}
