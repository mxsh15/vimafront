namespace ShopVima.Application.Dtos.HomeBanner;

public sealed record AdminHomeBannerListItemDto(
    Guid Id,
    Guid MediaAssetId,
    string MediaUrl,
    string? LinkUrl,
    string? Title,
    string? AltText,
    int SortOrder,
    bool IsActive,
    DateTimeOffset? StartAt,
    DateTimeOffset? EndAt
);