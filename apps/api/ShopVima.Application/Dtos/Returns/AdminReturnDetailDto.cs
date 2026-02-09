using ShopVima.Application.Dtos.Common;
using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.Returns;

public record AdminReturnDetailDto(
    Guid Id,
    Guid OrderId,
    Guid OrderItemId,
    string OrderNumber,
    string CustomerName,
    string CustomerEmail,
    string Reason,
    string? Description,
    ReturnStatus Status,
    string? AdminNotes,
    Guid? ReviewedBy,
    DateTime RequestedAt,
    DateTime? ApprovedAt,
    DateTime? CompletedAt,
    AdminRefundDto? Refund,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    bool IsDeleted,
    DateTime? DeletedAtUtc,
    string RowVersion
) : BaseDto(Id, CreatedAtUtc, UpdatedAtUtc, IsDeleted, RowVersion);
