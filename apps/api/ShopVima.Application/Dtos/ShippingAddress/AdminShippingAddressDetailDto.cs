using ShopVima.Application.Dtos.Common;

namespace ShopVima.Application.Dtos.ShippingAddress;

public record AdminShippingAddressDetailDto(
    Guid Id,
    Guid UserId,
    string UserFullName,
    string UserEmail,
    string? UserPhone,
    string Title,
    string Province,
    string City,
    string AddressLine,
    string? PostalCode,
    bool IsDefault,
    bool UsedInOrders,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    bool IsDeleted,
    DateTime? DeletedAtUtc,
    string RowVersion
) : BaseDto(Id, CreatedAtUtc, UpdatedAtUtc, IsDeleted, RowVersion);