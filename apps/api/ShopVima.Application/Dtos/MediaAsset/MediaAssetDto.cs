using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.MediaAsset;

public record MediaAssetDto(
    Guid Id,
    string Url,
    string? ThumbnailUrl,
    string? AltText,
    string? Title,
    MediaKind Kind,
    MediaProvider Provider,
    MediaUsage Usage,
    long FileSize,
    string? ContentType
);