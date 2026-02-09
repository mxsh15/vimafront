namespace ShopVima.Application.Dtos.ProductMedia;

public sealed class ProductMediaInputDto
{
    public Guid? Id { get; set; } 
    public string Url { get; set; } = default!;
    public string? ThumbnailUrl { get; set; }
    public string? AltText { get; set; }
    public int SortOrder { get; set; } = 0;
    public bool IsPrimary { get; set; } = false;
}
