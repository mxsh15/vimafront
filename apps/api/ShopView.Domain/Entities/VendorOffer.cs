using ShopVima.Domain.Common;
using ShopVima.Domain.Enums;

namespace ShopVima.Domain.Entities;

public class VendorOffer : BaseEntity
{
    public Guid VendorId { get; set; }
    public Vendor Vendor { get; set; } = default!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public ProductSaleModel SaleModel { get; set; } = ProductSaleModel.OnlinePricing;

    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }

    public bool ManageStock { get; set; } = false;          
    public StockStatus StockStatus { get; set; } = StockStatus.InStock;

    public int StockQuantity { get; set; }
    public BackorderPolicy BackorderPolicy { get; set; } = BackorderPolicy.DoNotAllow;
    public int? LowStockThreshold { get; set; }

    public bool IsDefaultForProduct { get; set; }
    public VendorOfferStatus Status { get; set; } = VendorOfferStatus.Pending;


    public int MinOrderQuantity { get; set; } = 1; // حداقل خرید
    public int MaxOrderQuantity { get; set; } = 0; // 0 یعنی نامحدود
    public int QuantityStep { get; set; } = 1;     // گام خرید

    public ICollection<VendorOfferVariant> Variants { get; set; } = new List<VendorOfferVariant>();
}