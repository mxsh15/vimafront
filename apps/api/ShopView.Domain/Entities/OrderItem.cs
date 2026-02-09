using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class OrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = default!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public Guid VendorOfferId { get; set; }
    public VendorOffer VendorOffer { get; set; } = default!;

    public Guid? ProductVariantId { get; set; }
    public ProductVariant? ProductVariant { get; set; }

    public string ProductTitle { get; set; } = default!; // عنوان محصول در زمان سفارش
    public string? VariantName { get; set; }              // نام گونه در زمان سفارش

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }                // قیمت واحد در زمان سفارش
    public decimal TotalPrice { get; set; }               // قیمت کل (UnitPrice * Quantity)

    public decimal? CommissionAmount { get; set; }        // مبلغ کمیسیون
}

