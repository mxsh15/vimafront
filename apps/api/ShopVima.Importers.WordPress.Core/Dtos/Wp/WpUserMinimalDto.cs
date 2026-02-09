using System.Text.Json.Serialization;

namespace ShopVima.Importers.WordPress.Core.Dtos.Wp;

public sealed class WpUserMinimalDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("username")]
    public string? Username { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("first_name")]
    public string? FirstName { get; set; }

    [JsonPropertyName("last_name")]
    public string? LastName { get; set; }

    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("roles")]
    public List<string>? Roles { get; set; }
}