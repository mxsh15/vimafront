using ShopVima.Application.Dtos.Common;
using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.Product;

public record ProductDto(
    Guid Id,
    // محتوا 
    string Title,
    string? EnglishTitle,
    string? ShortTitle,
    string Slug,
    string? Sku,
    string? DescriptionHtml,

    // مارکتینگ و ویترین
    bool IsFeatured,
    bool AllowCustomerReviews,
    bool AllowCustomerQuestions,
    bool IsVariantProduct,

    // وضعیت
    ProductStatus Status,
    ProductVisibility Visibility,

    // برند / فروشنده مالک
    Guid? BrandId,
    string? BrandTitle,
    Guid? OwnerVendorId,
    string? OwnerVendorName,

    // SEO
    string? MetaTitle,
     string? MetaDescription,
     string? Keywords,
     string? CanonicalUrl,
     string? SeoMetaRobots,
     string? SeoSchemaJson,
     bool AutoGenerateSnippet,
     bool AutoGenerateHeadTags,
     bool IncludeInSitemap,

    // اطلاعات پایه
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    bool IsDeleted,
    string RowVersion,

    // قیمت
    decimal? DefaultOfferPrice,
    decimal? DefaultOfferDiscountPrice,
    int? DefaultOfferStock,
    ProductSaleModel SaleModel,
    decimal? VendorCommissionPercent,

    // مدیا و دسته‌ها  
    string? PrimaryImageUrl,
    IReadOnlyList<Guid> CategoryIds,
    IReadOnlyList<string> GalleryImageUrls,
    IReadOnlyList<Guid> TagIds,

    bool? ManageStock,
    StockStatus? StockStatus,
    BackorderPolicy? BackorderPolicy,
    int? LowStockThreshold
//Guid Id,
//string Title,
//string? EnglishTitle,
//string Slug,
//string? Sku,
//string? Excerpt,
//string? DescriptionHtml,
//string? AdditionalNotes,
//string? ReviewHtml,
//bool IsFeatured,
//bool EnableQnA,
//bool EnableComments,
//ProductStatus Status,
//Guid? BrandId,
//string? BrandTitle,
//string? SeoTitle,
//string? SeoMetaDescription,
//string? SeoKeywords,
//string? SeoCanonicalUrl,
//Guid? OwnerVendorId,
//decimal? DefaultOfferPrice,
//decimal? DefaultOfferOldPrice,
//int? DefaultOfferStock,
//ProductSaleModel SaleModel,
//decimal? VendorCommissionPercent,
//bool HasColorVariants,
//string? GuideHtml,
//DateTime CreatedAtUtc,
//DateTime? UpdatedAtUtc,
//bool IsDeleted,
//string RowVersion,
//string? PrimaryImageUrl,
//IReadOnlyList<Guid> CategoryIds,
//IReadOnlyList<string> GalleryImageUrls,
//bool IsVariantProduct
) : BaseDto(Id, CreatedAtUtc, UpdatedAtUtc, IsDeleted, RowVersion);