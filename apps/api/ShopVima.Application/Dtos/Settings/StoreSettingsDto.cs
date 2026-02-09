using ShopVima.Application.Dtos.Common;

namespace ShopVima.Application.Dtos.Settings;

public record StoreSettingsDto(
    Guid Id,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    bool IsDeleted,
    string RowVersion,

    string StoreName,
    string? LogoUrl,
    string? SupportEmail,
    string? SupportPhone,

    string? InstagramUrl,
    string? TelegramUrl,
    string? WhatsappUrl,
    string? YoutubeUrl,
    string? LinkedinUrl,

    string? DefaultMetaTitle,
    string? DefaultMetaDescription,
    string? CanonicalBaseUrl,
    string? RobotsTxt,
    bool SitemapEnabled,

    string TimeZoneId,
    string DateFormat,

    bool MultiVendorEnabled,
    Guid? StoreVendorId
) : BaseDto(Id, CreatedAtUtc, UpdatedAtUtc, IsDeleted, RowVersion);
