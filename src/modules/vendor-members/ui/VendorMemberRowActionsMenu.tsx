"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import type { VendorMemberListItemDto } from "../types";
import { removeVendorMemberAction, updateVendorMemberAction } from "../actions";

export function VendorMemberRowActionsMenu({
    vendorId,
    member,
}: {
    vendorId: string;
    member: VendorMemberListItemDto;
}) {
    const router = useRouter();

    return (
        <RowActionsMenu
            editLabel="ویرایش"
            deleteLabel="حذف"
            onEdit={async () => {
                const role = (window.prompt("نقش را وارد کنید:", member.role) ?? member.role).trim();
                const isActive = window.confirm("عضو فعال باشد؟");
                await updateVendorMemberAction(vendorId, member.id, { role, isActive });
                router.refresh();
            }}
            onDelete={async () => {
                const ok = window.confirm(`عضو «${member.userFullName}» حذف شود؟`);
                if (!ok) return;
                await removeVendorMemberAction(vendorId, member.id);
                router.refresh();
            }}
        />
    );
}
