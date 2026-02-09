using ShopVima.Domain.Enums;


namespace ShopVima.Application.Dtos.Payment;

public class PaymentDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string TransactionId { get; set; } = default!;
    public string? ReferenceNumber { get; set; }
    public PaymentMethod Method { get; set; }
    public PaymentStatus Status { get; set; }
    public decimal Amount { get; set; }
    public string? GatewayName { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? FailureReason { get; set; }
}
