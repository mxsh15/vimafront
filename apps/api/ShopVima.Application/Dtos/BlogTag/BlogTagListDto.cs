namespace ShopVima.Application.Dtos.BlogTag;

public record BlogTagListDto(
    Guid Id,
    string Name,
    string Slug,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    DateTime? DeletedAtUtc
);
