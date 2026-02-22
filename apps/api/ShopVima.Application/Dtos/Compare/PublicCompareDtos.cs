namespace ShopVima.Application.Dtos.Compare;

public record CompareRequestDto(List<Guid> ProductIds);

public record CompareProductDto(
    Guid Id,
    string Title,
    string Slug,
    string? PrimaryImageUrl,
    decimal? MinPrice
);
