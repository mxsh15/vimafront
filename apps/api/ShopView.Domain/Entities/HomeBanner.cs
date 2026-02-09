using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class HomeBanner : BaseEntity
{
    public Guid MediaAssetId { get; set; }
    public MediaAsset MediaAsset { get; set; } = null!;
    public string? LinkUrl { get; set; }
    public string? Title { get; set; }
    public string? AltText { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset? StartAt { get; set; }
    public DateTimeOffset? EndAt { get; set; }
}