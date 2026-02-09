namespace ShopVima.Application.Dtos.BlogCategory;

public record BlogCategoryOptionDto(
    Guid Id,
    string Name,
    Guid? ParentId
);
