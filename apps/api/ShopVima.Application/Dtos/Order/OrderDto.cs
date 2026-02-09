using ShopVima.Application.Dtos.Common;
using ShopVima.Application.Dtos.Payment;
using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.Order;

public record OrderDto(
    Guid Id,
    string OrderNumber,
    Guid UserId,
    string UserFullName,
    Guid ShippingAddressId,
    OrderStatus Status,
    decimal SubTotal,
    decimal ShippingCost,
    decimal DiscountAmount,
    decimal TaxAmount,
    decimal TotalAmount,
    string? Notes,
    DateTime? ShippedAt,
    DateTime? DeliveredAt,
    DateTime CreatedAtUtc,
    List<OrderItemDto> Items,
    ShippingAddressDto? ShippingAddress,
    PaymentDto? Payment,
    ShippingDto? Shipping
) : BaseDto(Id, CreatedAtUtc, null, false, string.Empty);

