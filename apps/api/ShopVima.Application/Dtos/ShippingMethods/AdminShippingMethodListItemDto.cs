namespace ShopVima.Application.Dtos.ShippingMethods;

public record AdminShippingMethodListItemDto(
    Guid Id,
    string Title,
    string Code,
    bool Status,
    int SortOrder,
    decimal? DefaultPrice,
    DateTime CreatedAtUtc
);
