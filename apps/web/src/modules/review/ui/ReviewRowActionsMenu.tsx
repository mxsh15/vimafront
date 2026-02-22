"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import { approveReviewAction, rejectReviewAction, deleteReviewAction } from "../actions";
import { usePermissions } from "@/context/PermissionContext";

type ReviewRowActionsMenuProps = {
    review: {
        id: string;
        productTitle: string;
        userFullName: string;
        isApproved: boolean;
    };
};

export function ReviewRowActionsMenu({ review }: ReviewRowActionsMenuProps) {
    const router = useRouter();
    const { hasPermission } = usePermissions();
    const canApprove = hasPermission("reviews.approve") || hasPermission("reviews.manage");
    const canReject = hasPermission("reviews.reject") || hasPermission("reviews.manage");
    const canDelete = hasPermission("reviews.delete") || hasPermission("reviews.manage");

    if (!canApprove && !canReject && !canDelete) return null;

    const isPending = !review.isApproved;

    return (
        <RowActionsMenu
            editLabel={review.isApproved ? "تأیید شده" : "تأیید دیدگاه"}
            deleteLabel={isPending ? "رد دیدگاه" : "حذف"}
            onEdit={
                canApprove && isPending
                    ? async () => {
                        const ok = window.confirm("آیا از تأیید این دیدگاه مطمئن هستید؟");
                        if (!ok) return;
                        await approveReviewAction(review.id);
                        router.refresh();
                    }
                    : undefined
            }
            onDelete={
                isPending
                    ? canReject
                        ? async () => {
                            const ok = window.confirm("آیا از رد کردن این دیدگاه مطمئن هستید؟");
                            if (!ok) return;
                            await rejectReviewAction(review.id);
                            router.refresh();
                        }
                        : undefined
                    : canDelete
                        ? async () => {
                            const ok = window.confirm("آیا از حذف این دیدگاه مطمئن هستید؟");
                            if (!ok) return;
                            await deleteReviewAction(review.id);
                            router.refresh();
                        }
                        : undefined
            }
        />
    );
}
