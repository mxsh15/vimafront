"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import { restoreBlogTagAction, hardDeleteBlogTagAction } from "../actions";

export function BlogTagTrashRowActionsMenu({ id, title }: { id: string; title: string }) {
    const router = useRouter();

    return (
        <RowActionsMenu
            editLabel="بازیابی"
            deleteLabel="حذف دائمی"
            onEdit={async () => {
                await restoreBlogTagAction(id);
                router.refresh();
            }}
            onDelete={async () => {
                const ok = window.confirm(`حذف دائمی برچسب «${title}» انجام شود؟`);
                if (!ok) return;
                await hardDeleteBlogTagAction(id);
                router.refresh();
            }}
        />
    );
}
