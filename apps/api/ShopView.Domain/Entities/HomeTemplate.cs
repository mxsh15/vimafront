using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class HomeTemplate : BaseEntity
{
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string Slug { get; set; } = null!;
    public Guid? ThumbnailMediaAssetId { get; set; }
    public MediaAsset? ThumbnailMediaAsset { get; set; }
    public bool IsSystem { get; set; }
    public bool IsEnabled { get; set; } = true;
    public ICollection<HomeTemplateSection> Sections { get; set; } = new List<HomeTemplateSection>();
}
