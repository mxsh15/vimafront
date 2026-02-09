using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.Shipping;

public record ShippingDto(
    Guid Id,
    Guid OrderId,
    ShippingStatus Status,
    string? TrackingNumber,
    string? ShippingCompany,
    string? ShippingMethod,
    DateTime? ShippedAt,
    DateTime? DeliveredAt,
    DateTime? EstimatedDeliveryDate,
    DateTime CreatedAtUtc
);