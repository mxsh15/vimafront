"use client";

import type {
    AuthorOptionDto,
    BlogCategoryOptionDto,
    BlogTagOptionDto,
} from "../types";
import BlogPostModalButton from "./BlogPostModalButton";

export function BlogPostCreateButton({
    categoryOptions,
    tagOptions,
    authorOptions = []
}: {
    categoryOptions: BlogCategoryOptionDto[];
    tagOptions: BlogTagOptionDto[];
    authorOptions?: AuthorOptionDto[];
}) {
    return (
        <BlogPostModalButton
            categoryOptions={categoryOptions}
            tagOptions={tagOptions}
            authorOptions={authorOptions ?? []}
            asHeader
            triggerVariant="primary"
            label="نوشته جدید"
        />
    );
}
