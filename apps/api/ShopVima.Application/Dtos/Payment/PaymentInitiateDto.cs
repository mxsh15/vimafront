using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.Payment;

public class PaymentInitiateDto
{
    public Guid OrderId { get; set; }
    public PaymentMethod Method { get; set; } = PaymentMethod.Online;
}