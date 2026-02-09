using ShopVima.Domain.Common;
using ShopVima.Domain.Enums;

namespace ShopVima.Domain.Entities;

public class Payment : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = default!;

    public string TransactionId { get; set; } = default!; // شناسه تراکنش درگاه پرداخت
    public string? ReferenceNumber { get; set; }          // شماره مرجع

    public PaymentMethod Method { get; set; } = PaymentMethod.Online;
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

    public decimal Amount { get; set; }
    public string? GatewayName { get; set; }              // نام درگاه پرداخت

    public DateTime? PaidAt { get; set; }
    public string? FailureReason { get; set; }            // دلیل عدم موفقیت
}

