using Microsoft.EntityFrameworkCore;

namespace ShopVima.Domain.Common;

[Owned]
public class SeoMetadata
{
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
