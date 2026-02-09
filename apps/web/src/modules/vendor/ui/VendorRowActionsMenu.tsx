"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import { deleteVendorAction } from "@/modules/vendor/actions";
import { VendorEntityModal } from "./VendorEntityModal";
import type { VendorRow, VendorDto } from "../types";

type VendorRowActionsMenuProps = {
  vendor: VendorRow;
};

export function VendorRowActionsMenu({ vendor }: VendorRowActionsMenuProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  const vendorDto: VendorDto = {
    id: vendor.id,
    storeName: vendor.storeName,
    legalName: vendor.legalName ?? null,
    nationalId: vendor.nationalId ?? null,
    phoneNumber: vendor.phoneNumber ?? null,
    mobileNumber: vendor.mobileNumber ?? null,
    defaultCommissionPercent: vendor.defaultCommissionPercent ?? null,
    ownerUserId: vendor.ownerUserId ?? null,
    ownerUserName: vendor.ownerUserName,
    createdAtUtc: vendor.createdAtUtc,
    status: vendor.status,
  };

  return (
    <>
      <RowActionsMenu
        editLabel="ویرایش"
        deleteLabel="حذف فروشنده"
        onEdit={() => {
          setEditOpen(true);
        }}
        onDelete={async () => {
          const ok = window.confirm(
            `آیا از حذف فروشنده «${vendor.storeName}» مطمئن هستید؟`
          );
          if (!ok) return;
          await deleteVendorAction(vendor.id);
          router.refresh();
        }}
      />

      <VendorEntityModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        vendor={vendorDto}
      />
    </>
  );
}

