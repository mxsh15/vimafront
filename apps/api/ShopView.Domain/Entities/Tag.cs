using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

// تگ‌ها
public class Tag : BaseEntity
{
    public string Name { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public string? Description { get; set; }
    public SeoMetadata Seo { get; set; } = new();
    public ICollection<ProductTag> ProductTags { get; set; } = new List<ProductTag>();
}
