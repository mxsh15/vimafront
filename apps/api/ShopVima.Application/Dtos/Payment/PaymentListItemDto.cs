using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.Payment;

public class PaymentListItemDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string OrderNumber { get; set; } = default!;
    public Guid UserId { get; set; }
    public string CustomerName { get; set; } = default!;

    public string TransactionId { get; set; } = default!;
    public string? ReferenceNumber { get; set; }
    public PaymentMethod Method { get; set; }
    public PaymentStatus Status { get; set; }
    public decimal Amount { get; set; }
    public string? GatewayName { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
