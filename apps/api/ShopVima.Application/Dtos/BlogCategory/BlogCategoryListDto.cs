namespace ShopVima.Application.Dtos.BlogCategory;

public record BlogCategoryListDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    Guid? ParentId,
    string? ParentName,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    DateTime? DeletedAtUtc
);
