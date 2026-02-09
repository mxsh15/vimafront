namespace ShopVima.Importers.WordPress.Core.Dtos.Wp;

public sealed class WpMediaDto
{
    public int id { get; set; }
    public string? source_url { get; set; }
    public WpMediaDetailsDto? media_details { get; set; }
    public WpRendered? title { get; set; }
    public string? alt_text { get; set; }
}
