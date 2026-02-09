using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class ProductAnswer : BaseEntity
{
    public Guid QuestionId { get; set; }
    public ProductQuestion Question { get; set; } = default!;

    public Guid? VendorId { get; set; } // پاسخ فروشنده
    public Vendor? Vendor { get; set; }

    public Guid? UserId { get; set; } // پاسخ کاربر دیگر
    public User? User { get; set; }

    public string Answer { get; set; } = default!;
    public bool IsVerified { get; set; } = false; // پاسخ تایید شده
}

