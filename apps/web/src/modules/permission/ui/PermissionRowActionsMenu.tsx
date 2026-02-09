"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import { deletePermissionAction } from "@/modules/permission/actions";
import { PermissionEntityModal } from "./PermissionEntityModal";
import type { PermissionRow, PermissionDto } from "../types";

type PermissionRowActionsMenuProps = {
  permission: PermissionRow;
};

export function PermissionRowActionsMenu({
  permission,
}: PermissionRowActionsMenuProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  const permissionDto: PermissionDto = {
    id: permission.id,
    name: permission.name,
    displayName: permission.displayName,
    description: null,
    category: permission.category,
    createdAtUtc: permission.createdAtUtc,
    status: permission.status,
  };

  return (
    <>
      <RowActionsMenu
        editLabel="ویرایش"
        deleteLabel="حذف دسترسی"
        onEdit={() => {
          setEditOpen(true);
        }}
        onDelete={async () => {
          const ok = window.confirm(
            `آیا از حذف دسترسی «${permission.displayName || permission.name}» مطمئن هستید؟`
          );
          if (!ok) return;
          await deletePermissionAction(permission.id);
          router.refresh();
        }}
      />

      <PermissionEntityModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        permission={permissionDto}
      />
    </>
  );
}

