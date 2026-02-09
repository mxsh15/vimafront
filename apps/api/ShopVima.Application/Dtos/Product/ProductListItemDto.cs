using ShopVima.Application.Dtos.Common;
using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.Product;

public record ProductListItemDto(
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

    bool DefaultOfferManageStock,
    StockStatus DefaultOfferStockStatus,

    decimal? MinVariantPrice,
    decimal? MaxVariantPrice,
    int? TotalVariantStock,

    // مدیا و دسته‌ها  
    string? PrimaryImageUrl,
    IReadOnlyList<Guid> CategoryIds,
    IReadOnlyList<string> GalleryImageUrls,
    IReadOnlyList<Guid> TagIds

    // متریک‌های تجمیعی
    //double RatingAverage,
    //int RatingCount,
    //int ReviewCount,
    //int QuestionCount,
    //long ViewCount,
    //long SalesCount,
    ) : BaseDto(Id, CreatedAtUtc, UpdatedAtUtc, IsDeleted, RowVersion);