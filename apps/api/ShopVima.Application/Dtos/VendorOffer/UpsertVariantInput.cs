using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.VendorOffer;

public class UpsertVariantInput
{
    public Guid? Id { get; set; }
    public Guid? AttributeId { get; set; }
    public Guid? OptionId { get; set; }

    public string Sku { get; set; } = default!;

    public decimal? Price { get; set; }
    public decimal? OldPrice { get; set; }

    public decimal? MinVariablePrice { get; set; }
    public decimal? MaxVariablePrice { get; set; }

    public decimal? WeightKg { get; set; }
    public decimal? LengthCm { get; set; }
    public decimal? WidthCm { get; set; }
    public decimal? HeightCm { get; set; }

    public string? Description { get; set; }

    public int? MinOrderQuantity { get; set; }
    public int? MaxOrderQuantity { get; set; }
    public int? QuantityStep { get; set; }

    public bool ManageStock { get; set; }
    public StockStatus StockStatus { get; set; }
    public int StockQuantity { get; set; }
    public BackorderPolicy BackorderPolicy { get; set; }
    public int? LowStockThreshold { get; set; }
}

