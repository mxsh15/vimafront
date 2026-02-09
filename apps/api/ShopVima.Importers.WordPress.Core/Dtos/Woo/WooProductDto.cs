namespace ShopVima.Importers.WordPress.Core.Dtos.Woo;

public sealed class WooProductDto
{
    public int id { get; set; }
    public string? name { get; set; }
    public string? slug { get; set; }
    public string? permalink { get; set; }
    public string? sku { get; set; }
    public string? description { get; set; }
    public string? short_description { get; set; }
    public DateTime? date_created { get; set; }
    public DateTime? date_created_gmt { get; set; }
    public DateTime? date_modified { get; set; }
    public DateTime? date_modified_gmt { get; set; }

    public string? type { get; set; } // simple | variable | grouped | external
    public List<int>? variations { get; set; }

    public string? price { get; set; }
    public string? regular_price { get; set; }
    public string? sale_price { get; set; }

    public bool? manage_stock { get; set; }
    public int? stock_quantity { get; set; }
    public string? stock_status { get; set; } // instock | outofstock | onbackorder
    public string? backorders { get; set; }   // no | notify | yes



    public List<WooProductCategoryRefDto>? categories { get; set; }
    public List<WooProductTagRefDto>? tags { get; set; }
    public List<WooImageDto>? images { get; set; }
    public List<WooProductAttrInProductDto>? attributes { get; set; }
}