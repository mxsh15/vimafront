using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class CouponUsage : BaseEntity
{
    public Guid CouponId { get; set; }
    public Coupon Coupon { get; set; } = default!;

    public Guid OrderId { get; set; }
    public Order Order { get; set; } = default!;

    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public decimal DiscountAmount { get; set; }
}

