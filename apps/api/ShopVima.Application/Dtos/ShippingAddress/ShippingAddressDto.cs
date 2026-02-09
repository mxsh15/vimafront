using ShopVima.Application.Dtos.Common;

namespace ShopVima.Application.Dtos.ShippingAddress;

public record ShippingAddressDto(
    Guid Id,
    Guid UserId,
    string Title,
    string Province,
    string City,
    string AddressLine,
    string? PostalCode,
    bool IsDefault,
    double? Latitude,
    double? Longitude,
    DateTime CreatedAtUtc
) : BaseDto(Id, CreatedAtUtc, null, false, string.Empty);

