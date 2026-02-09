namespace ShopVima.Application.Dtos.ShippingZones;

public record AdminShippingZoneListItemDto(
    Guid Id,
    string Title,
    bool Status,
    int SortOrder,
    string? CountryCode,
    string? Province,
    string? City,
    DateTime CreatedAtUtc
);
