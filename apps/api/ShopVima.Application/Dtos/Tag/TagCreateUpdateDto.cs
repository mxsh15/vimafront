using System.ComponentModel.DataAnnotations;

namespace ShopVima.Application.Dtos.Tag;

public record TagCreateUpdateDto
{
    [Required, MaxLength(120)] 
    public string Name { get; init; } = default!;

    [Required, MaxLength(160)] 
    public string Slug { get; init; } = default!;
    public string? RowVersion { get; init; }
}
