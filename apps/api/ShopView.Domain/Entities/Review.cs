using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class Review : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public int Rating { get; set; } // 1-5
    public string? Title { get; set; }
    public string? Comment { get; set; }

    public bool IsApproved { get; set; } = false;
    public DateTime? ApprovedAt { get; set; }
    public Guid? ApprovedBy { get; set; } // Admin User ID

    public bool IsVerifiedPurchase { get; set; } = false; // آیا خریدار واقعی است
    public Guid? OrderItemId { get; set; } // اگر از سفارش باشد

    public int LikeCount { get; set; } = 0;
    public int DislikeCount { get; set; } = 0;
}

