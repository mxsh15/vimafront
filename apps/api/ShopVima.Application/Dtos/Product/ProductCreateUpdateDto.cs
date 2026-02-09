using ShopVima.Application.Dtos.ProductMedia;
using ShopVima.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace ShopVima.Application.Dtos.Product;

public class ProductCreateUpdateDto
{
    [Required, MaxLength(300)]
    public string Title { get; set; } = default!;

    [MaxLength(300)]
    public string? EnglishTitle { get; set; }

    [Required, MaxLength(300)]
    public string Slug { get; set; } = default!;

    [MaxLength(120)]
    public string? Sku { get; set; }

    public string? Excerpt { get; set; }
    public string? DescriptionHtml { get; set; }
    public string? AdditionalNotes { get; set; }
    public string? ReviewHtml { get; set; }

    public bool IsFeatured { get; set; }
    public bool EnableQnA { get; set; } = true;
    public bool EnableComments { get; set; } = true;

    public ProductStatus Status { get; set; } = ProductStatus.Published;

    public Guid? OwnerVendorId { get; set; }

    public Guid? BrandId { get; set; }

    // SEO
    public string? SeoTitle { get; set; }
    public string? SeoMetaDescription { get; set; }
    public string? SeoKeywords { get; set; }
    public string? SeoCanonicalUrl { get; set; }

    // مدل فروش محصول
    public ProductSaleModel SaleModel { get; set; } = ProductSaleModel.OnlinePricing;
    public string? InquiryPhone { get; set; }
    public string? InquiryMobile { get; set; }
    public decimal? VendorCommissionPercent { get; set; }
    public bool HasColorVariants { get; set; }
    public bool HasWarranty { get; set; }
    public string? GuideHtml { get; set; }


    [Range(0, double.MaxValue)]
    public decimal? Price { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? DiscountPrice { get; set; }

    [Range(0, int.MaxValue)]
    public int? Stock { get; set; }

    public List<ProductMediaInputDto> Media { get; set; } = new();

    public string? RowVersion { get; set; }
    public string? PrimaryImageUrl { get; set; }
    public List<Guid> CategoryIds { get; set; } = new();
    public List<string>? GalleryImageUrls { get; set; }

    public bool? ManageStock { get; set; }
    public StockStatus? StockStatus { get; set; } 
    public BackorderPolicy? BackorderPolicy { get; set; } 
    public int? LowStockThreshold { get; set; } 

    // variants property
    public bool IsVariantProduct { get; set; }
    public string? VariantsJson { get; set; }
    public string ShortTitle { get; set; }
    public bool AllowCustomerReviews { get; set; }
    public bool AllowCustomerQuestions { get; set; }
    public ProductVisibility Visibility { get; set; }
    public string? SeoMetaRobots { get; set; }
    public bool AutoGenerateSnippet { get; set; }
    public string? SeoSchemaJson { get; set; }
    public bool AutoGenerateHeadTags { get; set; }
    public bool IncludeInSitemap { get; set; }
    public List<Guid> TagIds { get; set; } = new();
}
