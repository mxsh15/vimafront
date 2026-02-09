using ShopVima.Domain.Common;
using ShopVima.Domain.Enums;

namespace ShopVima.Domain.Entities;

public class Coupon : BaseEntity
{
    public string Code { get; set; } = default!; // کد کوپن
    public string Title { get; set; } = default!;
    public string? Description { get; set; }

    public CouponType Type { get; set; } = CouponType.Percentage;
    public decimal Value { get; set; } // درصد یا مبلغ

    public decimal? MinPurchaseAmount { get; set; } // حداقل مبلغ خرید
    public decimal? MaxDiscountAmount { get; set; } // حداکثر تخفیف (برای درصدی)

    public int? MaxUsageCount { get; set; } // حداکثر تعداد استفاده
    public int UsedCount { get; set; } = 0;

    public int? MaxUsagePerUser { get; set; } // حداکثر استفاده برای هر کاربر

    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<CouponUsage> Usages { get; set; } = new List<CouponUsage>();
}

