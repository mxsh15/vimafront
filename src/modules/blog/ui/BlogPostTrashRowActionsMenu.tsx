"use client";

import { useRouter } from "next/navigation";
import { restoreBlogPostAction, hardDeleteBlogPostAction } from "../actions";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";

export function BlogPostTrashRowActionsMenu({
    id,
    title,
}: {
    id: string;
    title: string;
}) {
    const router = useRouter();

    return (
        <RowActionsMenu
            editLabel="بازیابی"
            deleteLabel="حذف دائمی"
            onEdit={async () => {
                await restoreBlogPostAction(id);
                router.refresh();
            }}
            onDelete={async () => {
                const ok = window.confirm(
                    `آیا از حذف دائمی نوشته «${title ?? ""}» مطمئن هستید؟`
                );
                if (!ok) return;

                await hardDeleteBlogPostAction(id);
                router.refresh();
            }}
        />
    );
}
