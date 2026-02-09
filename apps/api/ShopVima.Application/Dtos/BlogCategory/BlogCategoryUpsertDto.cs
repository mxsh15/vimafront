namespace ShopVima.Application.Dtos.BlogCategory;

public class BlogCategoryUpsertDto
{
    public Guid? Id { get; set; }
    public string Name { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public string? Description { get; set; }
    public Guid? ParentId { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? Keywords { get; set; }
    public string? CanonicalUrl { get; set; }
    public string? SeoMetaRobots { get; set; }
    public string? SeoSchemaJson { get; set; }
    public bool AutoGenerateSnippet { get; set; } = true;
    public bool AutoGenerateHeadTags { get; set; } = true;
    public bool IncludeInSitemap { get; set; } = true;
}
