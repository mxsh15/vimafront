using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.Order;

public record OrderListItemDto(
    Guid Id,
    string OrderNumber,
    string UserFullName,
    OrderStatus Status,
    decimal TotalAmount,
    int ItemsCount,
    DateTime CreatedAtUtc
);

