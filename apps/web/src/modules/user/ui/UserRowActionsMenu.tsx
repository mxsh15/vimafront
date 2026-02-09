"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import { deleteUserAction } from "@/modules/user/actions";
import { UserEntityModal } from "./UserEntityModal";
import type { UserRow, UserDto } from "../types";
import type { RoleOptionDto } from "../../role/types";
import type { VendorOptionDto } from "../../vendor/types";
import { getUserClient } from "../api.client";

type UserRowActionsMenuProps = {
  user: UserRow;
  roleOptions?: RoleOptionDto[];
  vendorOptions?: VendorOptionDto[];
};

export function UserRowActionsMenu({
  user,
  roleOptions = [],
  vendorOptions = [],
}: UserRowActionsMenuProps) {
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ این باید UserDto واقعی باشد (با vendorIds)
  const [userDto, setUserDto] = useState<UserDto | null>(null);

  async function openEdit() {
    setEditOpen(true);
    setLoading(true);
    try {
      const full = await getUserClient(user.id);
      setUserDto(full);
    } catch (e) {
      console.error(e);
      alert("خطا در دریافت اطلاعات کاربر برای ویرایش");
      setEditOpen(false);
      setUserDto(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <RowActionsMenu
        editLabel="ویرایش"
        deleteLabel="حذف کاربر"
        onEdit={openEdit}
        onDelete={async () => {
          const ok = window.confirm(
            `آیا از حذف کاربر «${user.fullName}» مطمئن هستید؟`
          );
          if (!ok) return;
          await deleteUserAction(user.id);
          router.refresh();
        }}
      />

      {editOpen && (
        <UserEntityModal
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
            setUserDto(null);
          }}
          user={userDto ?? undefined}
          roleOptions={roleOptions}
          vendorOptions={vendorOptions}
        />
      )}

      {editOpen && loading && (
        <div className="mt-2 text-xs text-slate-500">در حال بارگذاری اطلاعات...</div>
      )}
    </>
  );
}
