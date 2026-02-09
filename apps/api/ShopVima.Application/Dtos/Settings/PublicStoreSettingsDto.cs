namespace ShopVima.Application.Dtos.Settings;

public record PublicStoreSettingsDto(
    string StoreName,
    string? LogoUrl,
    string? SupportEmail,
    string? SupportPhone,
    string? InstagramUrl,
    string? TelegramUrl,
    string? WhatsappUrl,
    string? DefaultMetaTitle,
    string? DefaultMetaDescription,
    string? CanonicalBaseUrl,
    string DateFormat,
    string TimeZoneId,
    bool MultiVendorEnabled,
    Guid? StoreVendorId
);
