namespace ShopVima.Application.Dtos.Product;

public sealed record PublicCategoryProductDto(
    Guid Id,
    string Title,
    string Slug,
    string? ImageUrl,
    decimal? Price,
    decimal? OldPrice,
    int? DiscountPercent
);
