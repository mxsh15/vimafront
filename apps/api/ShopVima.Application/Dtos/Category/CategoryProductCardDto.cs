namespace ShopVima.Application.Dtos.Category;

public sealed record CategoryProductCardDto(
    Guid Id,
    string Title,
    string Slug,
    string? ImageUrl
);