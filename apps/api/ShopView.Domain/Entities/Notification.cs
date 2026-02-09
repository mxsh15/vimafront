using ShopVima.Domain.Common;
using ShopVima.Domain.Enums;

namespace ShopVima.Domain.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public string Title { get; set; } = default!;
    public string Message { get; set; } = default!;
    public NotificationType Type { get; set; } = NotificationType.System;

    public bool IsRead { get; set; } = false;
    public DateTime? ReadAt { get; set; }

    public string? RelatedEntityType { get; set; } // مثل "Order", "Product"
    public Guid? RelatedEntityId { get; set; }

    public string? ActionUrl { get; set; } // لینک مربوطه
}

