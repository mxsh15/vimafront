namespace ShopVima.Importers.WordPress.Core.Dtos.Woo;

// /wp-json/wc/v3/products/tags
public sealed class WooTagDto
{
    public int id { get; set; }
    public string? name { get; set; }
    public string? slug { get; set; }
}
