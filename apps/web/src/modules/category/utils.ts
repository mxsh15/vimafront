import { CategoryDto } from "./types";

export function buildCategoryBreadcrumb(
    category: CategoryDto,
    allCategories: CategoryDto[]
): CategoryDto[] {
    const map = new Map(allCategories.map(c => [c.id, c]));
    const path: CategoryDto[] = [];

    let current: CategoryDto | undefined = category;

    while (current) {
        path.unshift(current);
        current = current.parentId ? map.get(current.parentId) : undefined;
    }

    return path;
}