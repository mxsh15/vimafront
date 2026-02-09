using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.Payment;

public class PaymentVerifyResultDto
{
    public bool Success { get; set; }
    public Guid OrderId { get; set; }
    public Guid PaymentId { get; set; }
    public PaymentStatus Status { get; set; }
}