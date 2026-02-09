using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.Returns;

public record AdminRefundDto(
    Guid Id,
    Guid PaymentId,
    decimal Amount,
    RefundStatus Status,
    string? TransactionId,
    string? FailureReason,
    DateTime CreatedAt,
    DateTime? ProcessedAt
);
