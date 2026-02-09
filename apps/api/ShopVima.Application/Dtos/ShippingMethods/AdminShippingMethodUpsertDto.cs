namespace ShopVima.Application.Dtos.ShippingMethods;

public record AdminShippingMethodUpsertDto(
    string Title,
    string? Code,
    string? Description,
    bool Status,
    int SortOrder,
    decimal? DefaultPrice
);
