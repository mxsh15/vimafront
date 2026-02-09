"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import type { BlogTagListDto, BlogTagUpsertDto } from "../types";
import { BlogTagModalButton } from "./BlogTagModalButton";
import { deleteBlogTagAction } from "../actions";

export function BlogTagRowActionsMenu({ row }: { row: BlogTagListDto }) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);

    const tagForEdit: BlogTagUpsertDto = {
        id: row.id,
        name: row.name,
        slug: row.slug,
        autoGenerateSnippet: row.autoGenerateSnippet ?? false,
        autoGenerateHeadTags: row.autoGenerateHeadTags ?? false,
        includeInSitemap: row.includeInSitemap ?? true,
    };

    const handleDelete = async () => {
        const ok = window.confirm(`انتقال برچسب «${row.name}» به سطل زباله؟`);
        if (!ok) return;
        await deleteBlogTagAction(row.id);
        router.refresh();
    };

    return (
        <>
            <RowActionsMenu onEdit={() => setEditing(true)} onDelete={handleDelete} deleteLabel="انتقال به سطل زباله" />

            {editing && (
                <BlogTagModalButton
                    tag={tagForEdit}
                    initialOpen={true}
                    onOpenChange={(open) => {
                        if (!open) setEditing(false);
                    }}
                    triggerLabel=""
                    triggerClassName="hidden"
                />
            )}
        </>
    );
}
