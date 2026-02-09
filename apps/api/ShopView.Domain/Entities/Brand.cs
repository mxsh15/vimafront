using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;


public class Brand : BaseEntity
{
    public string Title { get; set; } = default!;            // عنوان فارسی
    public string? EnglishTitle { get; set; }                // عنوان انگلیسی
    public string Slug { get; set; } = default!;             // نامک یکتا
    public string? WebsiteUrl { get; set; }                  // وب‌سایت رسمی
    public string? ContentHtml { get; set; }                 // توضیحات (HTML)
    public string? LogoUrl { get; set; }                     // تصویر/لوگوی برند

    public SeoMetadata Seo { get; set; } = new();

    public ICollection<Product> Products { get; set; } = new List<Product>();
}