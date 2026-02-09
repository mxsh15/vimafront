namespace ShopVima.Application.Dtos.Order;

public record ShippingAddressDto(
    Guid Id,
    string Title,
    string Province,
    string City,
    string AddressLine,
    string? PostalCode
);

