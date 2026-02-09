using ShopVima.Domain.Common;
using ShopVima.Domain.Enums;

namespace ShopVima.Domain.Entities;

// مدیای محصول (گالری عکس/ویدئو/مدل 3D)
public class ProductMedia : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public MediaKind Kind { get; set; } = MediaKind.Image;
    public MediaProvider Provider { get; set; } = MediaProvider.Upload;

    public string Url { get; set; } = default!;            // آدرس فایل یا لینک
    public string? ThumbnailUrl { get; set; }              // برای ویدئو/لینک خارجی
    public string? AltText { get; set; }                   // متن جایگزین
    public int SortOrder { get; set; } = 0;
    public bool IsPrimary { get; set; } = false;
}
