using System.Text.Json.Serialization;

namespace ShopVima.Importers.WordPress.Core.Dtos.Wp;

public sealed class WpEmbeddedDto
{
    [JsonPropertyName("wp:featuredmedia")]
    public List<WpMediaDto>? FeaturedMedia { get; set; }
}
