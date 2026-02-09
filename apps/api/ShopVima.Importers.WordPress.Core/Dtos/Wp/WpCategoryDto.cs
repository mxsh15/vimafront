namespace ShopVima.Importers.WordPress.Core.Dtos.Wp;

public sealed class WpCategoryDto
{
    public int id { get; set; }
    public string? name { get; set; }
    public string? slug { get; set; }
    public int parent { get; set; }
}
