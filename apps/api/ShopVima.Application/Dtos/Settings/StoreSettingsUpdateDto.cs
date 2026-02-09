namespace ShopVima.Application.Dtos.Settings;

public record StoreSettingsUpdateDto(
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

    bool MultiVendorEnabled,

    string TimeZoneId,
    string DateFormat


);
