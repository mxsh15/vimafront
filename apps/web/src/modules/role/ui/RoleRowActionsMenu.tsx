"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import { deleteRoleAction } from "@/modules/role/actions";
import { RoleEntityModal } from "./RoleEntityModal";
import type { RoleRow, RoleDetailDto } from "../types";
import { getRole } from "../client-api";

type RoleRowActionsMenuProps = {
  role: RoleRow;
};

export function RoleRowActionsMenu({ role }: RoleRowActionsMenuProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [roleDetail, setRoleDetail] = useState<RoleDetailDto | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEdit = async () => {
    setLoading(true);
    try {
      const detail = await getRole(role.id);
      setRoleDetail(detail);
      setEditOpen(true);
    } catch (error) {
      console.error("Failed to load role details", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <RowActionsMenu
        editLabel="ویرایش"
        deleteLabel="حذف نقش"
        onEdit={handleEdit}
        onDelete={async () => {
          const ok = window.confirm(
            `آیا از حذف نقش «${role.name}» مطمئن هستید؟`
          );
          if (!ok) return;
          await deleteRoleAction(role.id);
          router.refresh();
        }}
      />

      {roleDetail && (
        <RoleEntityModal
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
            setRoleDetail(null);
          }}
          role={roleDetail}
        />
      )}
    </>
  );
}

