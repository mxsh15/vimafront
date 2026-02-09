namespace ShopVima.Importers.WordPress.Core.Dtos.Woo;

public sealed class WooProductAttrInProductDto
{
    public int id { get; set; }
    public string? name { get; set; }
    public bool variation { get; set; }
    public List<string>? options { get; set; }
}
