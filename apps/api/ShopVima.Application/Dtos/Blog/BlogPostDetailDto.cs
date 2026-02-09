namespace ShopVima.Application.Dtos.Blog;

public record BlogPostDetailDto(
    Guid Id,
    string Title,
    string Slug,
    string? ContentHtml,
    string? ThumbnailImageUrl,
    Guid? ThumbnailMediaId,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    string? AuthorName,
    IReadOnlyList<BlogCategoryDto> Categories,
    IReadOnlyList<BlogTagDto> Tags,
    string? MetaTitle,
    string? MetaDescription,
    string? Keywords,
    string? CanonicalUrl,
    string? SeoMetaRobots,
    string? SeoSchemaJson,
    bool AutoGenerateSnippet,
    bool AutoGenerateHeadTags,
    bool IncludeInSitemap,
    int Status,
    int Visibility
);