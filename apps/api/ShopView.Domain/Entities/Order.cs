using ShopVima.Domain.Common;
using ShopVima.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShopVima.Domain.Entities;

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = default!; // شماره سفارش یکتا

    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public Guid ShippingAddressId { get; set; }
    public ShippingAddress ShippingAddress { get; set; } = default!;

    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    public decimal SubTotal { get; set; }        // جمع کل آیتم‌ها
    public decimal ShippingCost { get; set; }    // هزینه ارسال
    public decimal DiscountAmount { get; set; }  // مبلغ تخفیف
    public decimal TaxAmount { get; set; }       // مالیات
    public decimal TotalAmount { get; set; }     // مبلغ نهایی

    public string? Notes { get; set; }           // یادداشت مشتری

    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }

    // Navigation properties
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public Shipping? Shipping { get; set; }
}

