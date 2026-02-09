using ShopVima.Domain.Common;
using ShopVima.Domain.Enums;

namespace ShopVima.Domain.Entities;

public class Discount : BaseEntity
{
    public string Title { get; set; } = default!;
    public string? Description { get; set; }

    public DiscountType Type { get; set; } = DiscountType.Percentage;
    public decimal Value { get; set; }

    public Guid? ProductId { get; set; } // تخفیف روی محصول خاص
    public Product? Product { get; set; }

    public Guid? CategoryId { get; set; } // تخفیف روی دسته‌بندی
    public CatalogCategory? Category { get; set; }

    public Guid? VendorId { get; set; } // تخفیف فروشنده خاص
    public Vendor? Vendor { get; set; }

    public Guid? BrandId { get; set; } // تخفیف برند خاص
    public Brand? Brand { get; set; }

    public decimal? MinPurchaseAmount { get; set; }
    public decimal? MaxDiscountAmount { get; set; }

    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }

    public bool IsActive { get; set; } = true;
}

