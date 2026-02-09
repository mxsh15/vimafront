using ShopVima.Domain.Common;
using ShopVima.Domain.Enums;

namespace ShopVima.Domain.Entities;

public class MediaAsset : BaseEntity
{
    public MediaKind Kind { get; set; } = MediaKind.Image;
    public MediaProvider Provider { get; set; } = MediaProvider.Upload;
    public MediaUsage Usage { get; set; } = MediaUsage.General;

    public string FileName { get; set; } = default!;   // ex: samsung-logo.png
    public string Url { get; set; } = default!;        // آدرس قابل دسترس
    public string? ThumbnailUrl { get; set; }          // برای تصاویر کوچک / ویدئو
    public string? Title { get; set; }                 // عنوان تصویر
    public string? AltText { get; set; }               // متن جایگزین
    public long FileSize { get; set; }                 // بایت
    public string? ContentType { get; set; }           // image/png, image/jpeg, ...


    public Guid? RelatedEntityId { get; set; }         // Id برند / محصول / دسته و ...
    public string? RelatedEntityType { get; set; }     // "Brand", "Product", "Category" و ...

    public int SortOrder { get; set; } = 0;
    public bool IsPrimary { get; set; } = false;
}