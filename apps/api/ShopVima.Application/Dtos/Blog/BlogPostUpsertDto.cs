using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.Blog;

public class BlogPostUpsertDto
{
    public Guid? Id { get; set; }
    public string Title { get; set; } = default!;
    public string? ShortTitle { get; set; }
    public string Slug { get; set; } = default!;
    public string? Summary { get; set; }
    public string? ContentHtml { get; set; }

    public Guid? ThumbnailMediaId { get; set; }
    public string? ThumbnailImageUrl { get; set; }

    public List<Guid> CategoryIds { get; set; } = new();
    public List<Guid> TagIds { get; set; } = new();

    public Guid? AuthorId { get; set; }


    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? Keywords { get; set; }
    public string? CanonicalUrl { get; set; }
    public string? SeoMetaRobots { get; set; }
    public string? SeoSchemaJson { get; set; }
    public string? SchemaJson { get; set; }
    public bool AutoGenerateSnippet { get; set; }
    public bool AutoGenerateHeadTags { get; set; }
    public bool IncludeInSitemap { get; set; }

    public ProductStatus Status { get; set; } = ProductStatus.Published;
    public ProductVisibility Visibility { get; set; } = ProductVisibility.PublicCatalog;
}