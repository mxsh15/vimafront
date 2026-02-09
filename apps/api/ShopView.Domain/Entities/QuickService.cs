using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class QuickService : BaseEntity
{
    public Guid MediaAssetId { get; set; }
    public MediaAsset MediaAsset { get; set; } = null!;

    public string Title { get; set; } = null!;
    public string? LinkUrl { get; set; }

    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
}
