using ShopVima.Domain.Common;
using ShopVima.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;


namespace ShopVima.Domain.Entities;

public class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public ProductStatus Status { get; set; } = ProductStatus.Published;
    public ProductVisibility Visibility { get; set; } = ProductVisibility.PublicCatalog;

    #region محتوا
    public string Title { get; set; } = default!;
    public string? EnglishTitle { get; set; }
    public string? ShortTitle { get; set; }
    public string Slug { get; set; } = default!;
    public string? Sku { get; set; }
    public string? DescriptionHtml { get; set; }
    #endregion

    #region مارکتینگ و ویترین
    public bool IsFeatured { get; set; } = false;
    public bool AllowCustomerReviews { get; set; } = true;
    public bool AllowCustomerQuestions { get; set; } = true;
    public bool IsVariantProduct { get; set; } = false;
    #endregion

    #region متریک‌های تجمیعی
    public double RatingAverage { get; set; } = 0; // میانگین امتیازات
    public int RatingCount { get; set; } = 0; // تعداد امتیازات
    public int ReviewCount { get; set; } = 0; // تعداد نظرات
    public int QuestionCount { get; set; } = 0; // تعداد سوالات
    public long ViewCount { get; set; } = 0; // تعداد بازدیدها
    public long SalesCount { get; set; } = 0; // تعداد فروش
    #endregion

    public SeoMetadata Seo { get; set; } = new();
    public Guid? BrandId { get; set; }
    public Brand? Brand { get; set; }
    public Guid? OwnerVendorId { get; set; }
    public Vendor? OwnerVendor { get; set; }
    public ICollection<ProductContentTab> ContentTabs { get; set; } = new List<ProductContentTab>();
    public ICollection<ProductFeature> Features { get; set; } = new List<ProductFeature>();
    public ICollection<ProductCategoryAssignment> ProductCategoryAssignments { get; set; } = new List<ProductCategoryAssignment>();
    [NotMapped]
    public IEnumerable<CatalogCategory> Categories => ProductCategoryAssignments.Select(pc => pc.Category);
    public ICollection<ProductMedia> ProductMedia { get; set; } = new List<ProductMedia>();
    public ICollection<ProductTag> ProductTags { get; set; } = new List<ProductTag>();
    public ICollection<ProductAttributeValue> AttributeValues { get; set; } = new List<ProductAttributeValue>();
    public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    public ICollection<VendorOffer> VendorOffers { get; set; } = new List<VendorOffer>();
}
