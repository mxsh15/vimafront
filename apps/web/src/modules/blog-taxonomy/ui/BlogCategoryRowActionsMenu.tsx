"use client";

import { useState } from "react";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import type {
    BlogCategoryListDto,
    BlogCategoryUpsertDto,
    BlogCategoryOptionDto,
} from "../types";
import { deleteBlogCategoryAction } from "../actions";
import { BlogCategoryModalButton } from "./BlogCategoryModalButton";
import { useRouter } from "next/navigation";

type Props = {
    row: BlogCategoryListDto;
    allCategories: BlogCategoryOptionDto[];
};

export function BlogCategoryRowActionsMenu({ row, allCategories }: Props) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);

    const categoryForEdit: BlogCategoryUpsertDto = {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        parentId: row.parentId ?? undefined,
        autoGenerateSnippet: row.autoGenerateSnippet ?? false,
        autoGenerateHeadTags: row.autoGenerateHeadTags ?? false,
        includeInSitemap: row.includeInSitemap ?? true,
    };

    const handleDelete = async () => {
        const ok = window.confirm(`حذف دسته «${row.name}»؟`);
        if (!ok) return;

        try {
            await deleteBlogCategoryAction(row.id);
            router.refresh();
        } catch (e) {
            console.error(e);
            alert("حذف دسته با خطا مواجه شد.");
        }
    };

    return (
        <>
            <RowActionsMenu
                onEdit={() => setEditing(true)}
                onDelete={handleDelete}
            />
            {editing && (
                <BlogCategoryModalButton
                    category={categoryForEdit}
                    allCategories={allCategories}
                    triggerLabel=""
                    triggerClassName="hidden"
                    initialOpen={true}
                    onOpenChange={(open) => {
                        if (!open) setEditing(false);
                    }}
                />
            )}
        </>
    );
}
