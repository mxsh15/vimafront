using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class BlogTag : BaseEntity
{
    public string Name { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public string? Description { get; set; }
    public SeoMetadata Seo { get; set; } = new();

    public ICollection<BlogPostTag> PostTags { get; set; } = new List<BlogPostTag>();
}