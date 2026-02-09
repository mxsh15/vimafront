namespace ShopVima.Application.Dtos.ProductVariant;

public class ProductVariantUpsertDto
{
    public Guid? Id { get; set; }      
    public Guid? AttributeId { get; set; } 
    public Guid? OptionId { get; set; }  
    public decimal? Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public int? Stock { get; set; }
    public string Sku { get; set; }
    public decimal? MinVariablePrice { get; set; }
    public decimal? MaxVariablePrice { get; set; }
    public decimal? WeightKg { get; set; }
    public decimal? LengthCm { get; set; }
    public decimal? WidthCm { get; set; }
    public decimal? HeightCm { get; set; }
    public string Description { get; set; }
    public int? MinOrderQuantity { get; set; }
    public int? MaxOrderQuantity { get; set; }
    public int? QuantityStep { get; set; }
    public bool? ManageStock { get; set; }
    public int? StockStatus { get; set; }
    public int? BackorderPolicy { get; set; }
    public int? LowStockThreshold { get; set; }
}