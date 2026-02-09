using ShopVima.Domain.Common;
using ShopVima.Domain.Enums;

namespace ShopVima.Domain.Entities;

public class Refund : BaseEntity
{
    public Guid ReturnRequestId { get; set; }
    public ReturnRequest ReturnRequest { get; set; } = default!;

    public Guid PaymentId { get; set; }
    public Payment Payment { get; set; } = default!;

    public decimal Amount { get; set; }
    public RefundStatus Status { get; set; } = RefundStatus.Pending;

    public string? TransactionId { get; set; } // شناسه تراکنش بازپرداخت
    public string? FailureReason { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedAt { get; set; }
}

