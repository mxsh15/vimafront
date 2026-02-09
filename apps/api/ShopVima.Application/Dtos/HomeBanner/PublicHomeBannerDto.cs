namespace ShopVima.Application.Dtos.HomeBanner;

public sealed record PublicHomeBannerDto(
    Guid MediaAssetId,
    string MediaUrl,
    string? LinkUrl,
    string? Title,
    string? AltText
);
