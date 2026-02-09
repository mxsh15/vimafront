namespace ShopVima.Application.Dtos.ShippingZones;

public record AdminShippingZoneUpsertDto(
    string Title,
    string? Description,
    bool Status,
    int SortOrder,
    string? CountryCode,
    string? Province,
    string? City,
    string? PostalCodePattern
);
