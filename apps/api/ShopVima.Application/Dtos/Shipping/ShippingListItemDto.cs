using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.Shipping;

public record ShippingListItemDto(
    Guid Id,
    Guid OrderId,
    string OrderNumber,
    Guid UserId,
    string CustomerName,
    string Province,
    string City,
    ShippingStatus Status,
    string? TrackingNumber,
    string? ShippingCompany,
    string? ShippingMethod,
    DateTime? ShippedAt,
    DateTime? DeliveredAt,
    DateTime? EstimatedDeliveryDate,
    DateTime CreatedAtUtc
);

