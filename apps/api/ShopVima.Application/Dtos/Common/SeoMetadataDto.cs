namespace ShopVima.Application.Dtos.Common;

public class SeoMetadataDto
{
    public SeoMetadataDto()
    {
    }

    public SeoMetadataDto(string? metaTitle, string? metaDescription, string? keywords, string? canonicalUrl, bool autoGenerateSnippet, bool autoGenerateHeadTags, bool includeInSitemap)
    {
        MetaTitle = metaTitle;
        MetaDescription = metaDescription;
        Keywords = keywords;
        CanonicalUrl = canonicalUrl;
        AutoGenerateSnippet = autoGenerateSnippet;
        AutoGenerateHeadTags = autoGenerateHeadTags;
        IncludeInSitemap = includeInSitemap;
    }

    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? Keywords { get; set; }
    public string? CanonicalUrl { get; set; }
    public bool AutoGenerateSnippet { get; set; } = true;
    public bool AutoGenerateHeadTags { get; set; } = true;
    public bool IncludeInSitemap { get; set; } = true;
}
