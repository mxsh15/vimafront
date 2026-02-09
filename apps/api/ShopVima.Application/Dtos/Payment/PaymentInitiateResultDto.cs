namespace ShopVima.Application.Dtos.Payment;

public class PaymentInitiateResultDto
{
    public string TransactionId { get; set; } = default!;
    public string PaymentUrl { get; set; } = default!;
    public Guid PaymentId { get; set; }
    public Guid OrderId { get; set; }
}