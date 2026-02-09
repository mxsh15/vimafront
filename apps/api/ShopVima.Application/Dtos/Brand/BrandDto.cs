using ShopVima.Application.Dtos.Common;

namespace ShopVima.Application.Dtos.Brand;

public record BrandDto(
    Guid Id,
    string Title,
    string? EnglishTitle,
    string Slug,
    string? WebsiteUrl,
    string? ContentHtml,
    string? LogoUrl,
    SeoMetadataDto Seo,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    bool IsDeleted,
    string RowVersion,
    bool status
) : BaseDto(Id, CreatedAtUtc, UpdatedAtUtc, IsDeleted, RowVersion);
