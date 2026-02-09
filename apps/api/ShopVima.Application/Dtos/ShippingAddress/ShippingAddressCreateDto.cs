namespace ShopVima.Application.Dtos.ShippingAddress;

public record ShippingAddressCreateDto(
    string Title,
    string FirstName,
    string LastName,
    string? PhoneNumber,
    string MobileNumber,
    string Province,
    string City,
    string AddressLine,
    string? PostalCode,
    bool IsDefault,
    double? Latitude,
    double? Longitude
);

