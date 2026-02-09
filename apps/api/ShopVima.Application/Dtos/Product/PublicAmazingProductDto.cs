namespace ShopVima.Application.Dtos.Product;

public sealed record PublicAmazingProductDto(
    Guid Id,
    string Slug,
    string Title,
    string? ImageUrl,
    decimal Price,
    decimal? OldPrice,
    int? DiscountPercent
);