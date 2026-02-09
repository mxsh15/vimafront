using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class BlogCategory : BaseEntity
{
    public string Name { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public string? Description { get; set; }

    public Guid? ParentId { get; set; }
    public BlogCategory? Parent { get; set; }
    public ICollection<BlogCategory> Children { get; set; } = new List<BlogCategory>();

    public SeoMetadata Seo { get; set; } = new();

    public ICollection<BlogPostCategory> PostCategories { get; set; } = new List<BlogPostCategory>();
}
