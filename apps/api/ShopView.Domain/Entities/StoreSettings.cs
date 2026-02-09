using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class StoreSettings : BaseEntity
{
    // عمومی
    public string StoreName { get; set; } = "ShopVima";
    public string? LogoUrl { get; set; }

    public string? SupportEmail { get; set; }
    public string? SupportPhone { get; set; }

    // شبکه‌های اجتماعی
    public string? InstagramUrl { get; set; }
    public string? TelegramUrl { get; set; }
    public string? WhatsappUrl { get; set; }
    public string? YoutubeUrl { get; set; }
    public string? LinkedinUrl { get; set; }

    // SEO عمومی
    public string? DefaultMetaTitle { get; set; }
    public string? DefaultMetaDescription { get; set; }
    public string? CanonicalBaseUrl { get; set; }
    public string? RobotsTxt { get; set; }
    public bool SitemapEnabled { get; set; } = true;

    // زمان/فرمت
    public string TimeZoneId { get; set; } = "Asia/Tehran";
    public string DateFormat { get; set; } = "yyyy/MM/dd";

    public bool MultiVendorEnabled { get; set; } = true;
    public Guid? StoreVendorId { get; set; }
    public Guid? ActiveHomeTemplateId { get; set; }
}
