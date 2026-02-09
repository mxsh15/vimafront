using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.Shipping;

public record ShippingUpsertDto(
    ShippingStatus Status,
    string? TrackingNumber,
    string? ShippingCompany,
    string? ShippingMethod,
    DateTime? ShippedAt,
    DateTime? DeliveredAt,
    DateTime? EstimatedDeliveryDate
);