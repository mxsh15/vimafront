namespace ShopVima.Importers.WordPress.Core.Dtos.Woo;

public sealed class WooCategoryDto
{
    public int id { get; set; }
    public string? name { get; set; }
    public string? slug { get; set; }
    public int parent { get; set; }
}
