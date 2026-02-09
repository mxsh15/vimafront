using ShopVima.Domain.Common;
using ShopVima.Domain.Enums;

namespace ShopVima.Domain.Entities;

public class Shipping : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = default!;

    public ShippingStatus Status { get; set; } = ShippingStatus.Pending;

    public string? TrackingNumber { get; set; }           // شماره پیگیری
    public string? ShippingCompany { get; set; }          // شرکت پست/پیک
    public string? ShippingMethod { get; set; }           // روش ارسال

    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime? EstimatedDeliveryDate { get; set; }  // تاریخ تخمینی تحویل
}

