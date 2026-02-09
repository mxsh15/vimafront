namespace ShopVima.Application.Dtos.Category;

public sealed record CategoryProductsGridDto(
    Guid CategoryId,
    string CategoryTitle,
    string CategorySlug,
    IReadOnlyList<CategoryProductCardDto> Items
);