using ShopVima.Application.Dtos.Common;
using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.Returns;

public record AdminReturnListItemDto(
    Guid Id,
    Guid OrderId,
    Guid OrderItemId,
    string OrderNumber,
    string CustomerName,
    string CustomerEmail,
    string Reason,
    ReturnStatus Status,
    DateTime RequestedAt,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    bool IsDeleted,
    DateTime? DeletedAtUtc,
    string RowVersion
) : BaseDto(Id, CreatedAtUtc, UpdatedAtUtc, IsDeleted, RowVersion);
