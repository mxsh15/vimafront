namespace ShopVima.Application.Dtos.Category;

public record CategoryListItemDto(
    Guid Id,
    string Title,
    string Slug,
    Guid? ParentId,
    int SortOrder,
    bool IsActive,
    string? ContentHtml,
    string? IconUrl,
    string? SeoTitle,
    string? SeoDescription,
    string? SeoKeywords
);
