namespace ShopVima.Application.Dtos.Category;

public sealed record CategoryOptionDto(
    Guid Id,
    string Title,
    Guid? ParentId,
    int SortOrder,
     string? IconUrl
);