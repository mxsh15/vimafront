namespace ShopVima.Importers.WordPress.Core.Dtos.Woo;

public sealed class WooProductVariationDto
{
    public int id { get; set; }
    public string? sku { get; set; }

    public string? price { get; set; }
    public string? regular_price { get; set; }
    public string? sale_price { get; set; }

    public bool? manage_stock { get; set; }
    public int? stock_quantity { get; set; }
    public string? stock_status { get; set; } // instock | outofstock | onbackorder

    public string? description { get; set; }
    public string? weight { get; set; }
    public WooDimensionsDto? dimensions { get; set; }

    public List<WooVariationAttributeDto>? attributes { get; set; }
}
