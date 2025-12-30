"use client";

import { useTransition } from "react";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import { approveReviewAction, deleteReviewAction } from "../actions";

type ReviewRowActionsMenuProps = {
    review: {
        id: string;
        productTitle: string;
        userFullName: string;
        isApproved: boolean;
    };
};

export function ReviewRowActionsMenu({ review }: ReviewRowActionsMenuProps) {
    const [pending, startTransition] = useTransition();

    const handleApprove = () => {
        if (review.isApproved) return;
        startTransition(async () => {
            await approveReviewAction(review.id);
        });
    };

    const handleDelete = () => {
        if (!confirm("آیا از حذف این دیدگاه مطمئن هستید؟")) return;
        startTransition(async () => {
            await deleteReviewAction(review.id);
        });
    };

    return (
        <RowActionsMenu
            onEdit={handleApprove}
            onDelete={handleDelete}
            editLabel={review.isApproved ? "تأیید شده" : "تأیید دیدگاه"}
            deleteLabel="حذف"
        />
    );
}
