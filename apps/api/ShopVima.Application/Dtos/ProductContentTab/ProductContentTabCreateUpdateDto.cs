using System.ComponentModel.DataAnnotations;


namespace ShopVima.Application.Dtos.ProductContentTab;

public record ProductContentTabCreateUpdateDto
{
    [Required, MaxLength(200)] public string Title { get; init; } = default!;
    public string? ContentHtml { get; init; }
    public int SortOrder { get; init; } = 0;
    public bool IsActive { get; init; } = true;
    public string? RowVersion { get; init; }
}
