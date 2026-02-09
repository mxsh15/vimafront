namespace ShopVima.Application.Dtos.Brand;

public record BrandListItemDto(
    Guid Id,
    string Title,
    string? EnglishTitle,
    string Slug,
    string? LogoUrl
);
