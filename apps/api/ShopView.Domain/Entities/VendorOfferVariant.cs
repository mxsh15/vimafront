using ShopVima.Domain.Enums;

namespace ShopVima.Domain.Entities;

public class VendorOfferVariant
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid VendorOfferId { get; set; }
    public VendorOffer VendorOffer { get; set; } = default!;

    public Guid ProductVariantId { get; set; }
    public ProductVariant ProductVariant { get; set; } = default!;

    public string Sku { get; set; } = default!;
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public decimal? MinVariablePrice { get; set; }
    public decimal? MaxVariablePrice { get; set; }
    public decimal? WeightKg { get; set; }
    public decimal? LengthCm { get; set; }
    public decimal? WidthCm { get; set; }
    public decimal? HeightCm { get; set; }
    public string? Description { get; set; }
    public int MinOrderQuantity { get; set; } = 0;
    public int MaxOrderQuantity { get; set; } = 0;
    public int QuantityStep { get; set; } = 1;
    public bool ManageStock { get; set; } = false;
    public StockStatus StockStatus { get; set; } = StockStatus.InStock;
    public int StockQuantity { get; set; }
    public BackorderPolicy BackorderPolicy { get; set; } = BackorderPolicy.DoNotAllow;
    public int? LowStockThreshold { get; set; }
}