using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.Payment;

public class PaymentVerifyDto
{
    public string TransactionId { get; set; } = default!;
    public string? ReferenceNumber { get; set; }
    public bool Success { get; set; } = true;            // برای تست/وبهوک
    public string? FailureReason { get; set; }           // اگر ناموفق بود
}