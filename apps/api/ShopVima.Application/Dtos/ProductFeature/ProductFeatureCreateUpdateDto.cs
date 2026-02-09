using System.ComponentModel.DataAnnotations;


namespace ShopVima.Application.Dtos.ProductFeature;

public record ProductFeatureCreateUpdateDto
{
    [Required, MaxLength(200)] public string Title { get; init; } = default!;
    [MaxLength(1000)] public string? Value { get; init; }
    public int SortOrder { get; init; } = 0;
    public string? RowVersion { get; init; }
}
