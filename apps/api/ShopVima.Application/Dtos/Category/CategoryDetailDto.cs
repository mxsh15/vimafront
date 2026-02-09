namespace ShopVima.Application.Dtos.Category;

public record CategoryDetailDto(
    Guid Id,
    string Title,
    string Slug,
    string? ContentHtml,
    string? IconUrl,
    Guid? ParentId,
    int SortOrder,
    bool IsActive,
    string? SeoTitle,
    string? SeoDescription,
    string? SeoKeywords
);