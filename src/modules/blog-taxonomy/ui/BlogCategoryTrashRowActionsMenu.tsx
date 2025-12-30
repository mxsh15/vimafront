"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import { restoreBlogCategoryAction, hardDeleteBlogCategoryAction } from "../actions";

export function BlogCategoryTrashRowActionsMenu({ id, title }: { id: string; title: string }) {
    const router = useRouter();

    return (
        <RowActionsMenu
            editLabel="بازیابی"
            deleteLabel="حذف دائمی"
            onEdit={async () => {
                await restoreBlogCategoryAction(id);
                router.refresh();
            }}
            onDelete={async () => {
                const ok = window.confirm(`حذف دائمی دسته «${title}» انجام شود؟`);
                if (!ok) return;
                await hardDeleteBlogCategoryAction(id);
                router.refresh();
            }}
        />
    );
}
