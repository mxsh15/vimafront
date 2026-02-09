namespace ShopVima.Application.Dtos.Blog;

public record BlogCategoryDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    Guid? ParentId,
    string? ParentName
);