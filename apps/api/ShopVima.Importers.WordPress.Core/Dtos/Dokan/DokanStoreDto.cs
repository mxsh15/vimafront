using System.Text.Json.Serialization;

namespace ShopVima.Importers.WordPress.Core.Dtos.Dokan;

public sealed class DokanStoreDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("store_name")]
    public string? StoreName { get; set; }

    [JsonPropertyName("first_name")]
    public string? FirstName { get; set; }

    [JsonPropertyName("last_name")]
    public string? LastName { get; set; }

    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; }

    [JsonPropertyName("registered")]
    public string? Registered { get; set; }

    [JsonPropertyName("admin_commission")]
    public string? AdminCommission { get; set; }

    [JsonPropertyName("admin_commission_type")]
    public string? AdminCommissionType { get; set; }
}
