using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.Order;

public record ShippingDto(
    Guid Id,
    ShippingStatus Status,
    string? TrackingNumber,
    string? ShippingCompany,
    string? ShippingMethod,
    DateTime? ShippedAt,
    DateTime? DeliveredAt,
    DateTime? EstimatedDeliveryDate
);

