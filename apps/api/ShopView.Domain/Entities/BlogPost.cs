using ShopVima.Domain.Common;
using ShopVima.Domain.Enums;

namespace ShopVima.Domain.Entities;

public class BlogPost : BaseEntity
{
    public string Title { get; set; } = default!;
    public string? ShortTitle { get; set; }
    public string Slug { get; set; } = default!;
    public string? ContentHtml { get; set; }
    public Guid? ThumbnailMediaId { get; set; } 
    public MediaAsset? ThumbnailMedia { get; set; }
    public string? ThumbnailImageUrl { get; set; }
    public Guid? AuthorId { get; set; }
    public User? Author { get; set; }

    public ProductStatus Status { get; set; } = ProductStatus.Published;
    public ProductVisibility Visibility { get; set; } = ProductVisibility.PublicCatalog;

    public SeoMetadata Seo { get; set; } = new();

    public ICollection<BlogPostCategory> PostCategories { get; set; } = new List<BlogPostCategory>();
    public ICollection<BlogPostTag> PostTags { get; set; } = new List<BlogPostTag>();

}

