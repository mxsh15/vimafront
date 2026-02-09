using ShopVima.Domain.Common;
using ShopVima.Domain.Enums;

namespace ShopVima.Domain.Entities;

public class ReturnRequest : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = default!;

    public Guid OrderItemId { get; set; }
    public OrderItem OrderItem { get; set; } = default!;

    public string Reason { get; set; } = default!;
    public string? Description { get; set; }

    public ReturnStatus Status { get; set; } = ReturnStatus.Pending;

    public string? AdminNotes { get; set; }
    public Guid? ReviewedBy { get; set; } // Admin User ID

    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ApprovedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    public Refund? Refund { get; set; }
}

