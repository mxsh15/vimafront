namespace ShopVima.Application.Dtos.Blog;

public record BlogPostListDto(
    Guid Id,
    Guid? ThumbnailMediaId,
    string? ThumbnailImageUrl,
    string Title,
    string Slug,
    Guid? AuthorId,
    string? AuthorName,
    IReadOnlyList<string> Categories,
    int Status,
    DateTime? PublishedAtUtc,
    DateTime? UpdatedAtUtc,
    DateTime CreatedAtUtc
);