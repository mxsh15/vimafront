"use client";

import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import type { AuthorOptionDto, BlogPostDto, BlogPostListItemDto } from "../types";
import { deleteBlogPostAction } from "../actions";
import BlogPostModalButton from "./BlogPostModalButton";
import { useState } from "react";
import { clientGetBlogPost } from "../api.client";
import type { BlogCategoryOptionDto, BlogTagOptionDto } from "../types";

export function BlogPostRowMenuCell({
    row,
    categoryOptions,
    tagOptions,
    authorOptions
}: {
    row: BlogPostListItemDto;
    categoryOptions: BlogCategoryOptionDto[];
    tagOptions: BlogTagOptionDto[];
    authorOptions?: AuthorOptionDto[];
}) {
    const [post, setPost] = useState<BlogPostDto | null>(null);
    const [open, setOpen] = useState(false);

    const handleEdit = async () => {
        const data = await clientGetBlogPost(row.id);
        setPost(data);
        setOpen(true);
    };

    return (
        <>
            <RowActionsMenu
                onEdit={handleEdit}
                onDelete={async () => {
                    if (!confirm(`حذف نوشته «${row.title}»؟`)) return;
                    await deleteBlogPostAction(row.id);
                }}
            />

            <BlogPostModalButton
                post={post}
                categoryOptions={categoryOptions}
                tagOptions={tagOptions}
                authorOptions={authorOptions ?? []}
                open={open}
                onOpenChange={setOpen}
                hideTrigger
            />
        </>
    );
}
