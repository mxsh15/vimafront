using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Product;
using ShopVima.Application.Dtos.ProductVariant;
using ShopVima.Application.Dtos.VariantAttributeValue;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Domain.Enums;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/products")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly ShopDbContext _db;
    public ProductsController(ShopDbContext db) => _db = db;

    private Guid GetCurrentUserId()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdValue) || !Guid.TryParse(userIdValue, out var userId))
            throw new InvalidOperationException("Current user id claim is missing or invalid.");

        return userId;
    }

    private bool IsAdmin()
    {
        return User.IsInRole("Admin");
    }

    private async Task<bool> IsMemberOfVendorAsync(Guid userId, Guid vendorId)
    {
        return await _db.VendorMembers
            .AnyAsync(vm => vm.UserId == userId && vm.VendorId == vendorId && vm.IsActive);
    }

    private string GenerateVariantCode(Product product, ProductVariantUpsertDto dto)
    {
        var slugPart = string.IsNullOrWhiteSpace(product.Slug)
            ? product.Id.ToString("N")[..8]
            : product.Slug;

        string optionPart;

        if (dto.OptionId.HasValue)
        {
            optionPart = dto.OptionId.Value.ToString("N")[..8];
        }
        else
        {
            optionPart = Guid.NewGuid().ToString("N")[..8];
        }

        return $"{slugPart}-{optionPart}";
    }



    [HttpGet]
    [RequirePermission("products.view")]
    public async Task<ActionResult<PagedResult<ProductListItemDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null,
        [FromQuery] Guid? brandId = null,
        [FromQuery] string? status = null,
        CancellationToken ct = default)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var userId = GetCurrentUserId();
        var isAdmin = IsAdmin();

        // 1) Base query (فقط Products، بدون Include)
        IQueryable<Product> baseQuery = _db.Products
            .AsNoTracking()
            .Where(p => !p.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            baseQuery = baseQuery.Where(p =>
                p.Title.Contains(s) ||
                p.Slug.Contains(s) ||
                (p.Sku != null && p.Sku.Contains(s)));
        }

        if (brandId.HasValue)
            baseQuery = baseQuery.Where(p => p.BrandId == brandId.Value);

        if (!isAdmin)
        {
            var vendorIds = await _db.VendorMembers
                .AsNoTracking()
                .Where(vm => vm.UserId == userId && vm.IsActive)
                .Select(vm => vm.VendorId)
                .ToListAsync(ct);

            if (vendorIds.Count == 0)
                return Ok(new PagedResult<ProductListItemDto>([], 0, page, pageSize));

            baseQuery = baseQuery.Where(p => p.OwnerVendorId.HasValue && vendorIds.Contains(p.OwnerVendorId.Value));
        }

        if (!string.IsNullOrWhiteSpace(status) &&
            Enum.TryParse<ProductStatus>(status, true, out var st))
        {
            baseQuery = baseQuery.Where(p => p.Status == st);
        }

        baseQuery = baseQuery.OrderByDescending(p => p.CreatedAtUtc);

        // 2) Count
        var total = await baseQuery.CountAsync(ct);

        // 3) Page Ids (خیلی سبک)
        var pageRows = await baseQuery
            .OrderByDescending(p => p.CreatedAtUtc)
            .Select(p => new { p.Id, p.CreatedAtUtc })
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var ids = pageRows.Select(x => x.Id).ToList();
        if (ids.Count == 0)
            return Ok(new PagedResult<ProductListItemDto>([], total, page, pageSize));

        // 4) Load products for these ids (فقط فیلدهای لازم)
        var products = await _db.Products
            .AsNoTracking()
            .Where(p => ids.Contains(p.Id))
            .Select(p => new
            {
                p.Id,
                p.Title,
                p.EnglishTitle,
                p.ShortTitle,
                p.Slug,
                p.Sku,
                p.DescriptionHtml,

                p.IsFeatured,
                p.AllowCustomerReviews,
                p.AllowCustomerQuestions,
                p.IsVariantProduct,
                p.Status,
                p.Visibility,

                p.BrandId,
                BrandTitle = p.Brand != null ? p.Brand.Title : null,

                p.OwnerVendorId,
                OwnerVendorStoreName = p.OwnerVendor != null ? p.OwnerVendor.StoreName : null,

                Seo = p.Seo, // اگر owned/complex type است مشکلی ندارد؛ اگر نه، فیلد به فیلد بردارید

                p.CreatedAtUtc,
                p.UpdatedAtUtc,
                p.IsDeleted,
                p.RowVersion
            })
            .ToListAsync(ct);

        var prodMap = products.ToDictionary(x => x.Id, x => x);

        // 5) Default offers (فقط برای همین محصولات)
        var offers = await _db.VendorOffers
            .AsNoTracking()
            .Where(o => ids.Contains(o.ProductId) && o.IsDefaultForProduct && !o.IsDeleted)
            .Select(o => new
            {
                o.ProductId,
                o.Price,
                o.DiscountPrice,
                o.StockQuantity,
                o.SaleModel,
                o.ManageStock,
                o.StockStatus,

                MinVariantPrice = o.Variants.Any()
                    ? (decimal?)o.Variants.Min(v => v.MinVariablePrice ?? v.Price)
                    : null,

                MaxVariantPrice = o.Variants.Any()
                    ? (decimal?)o.Variants.Max(v => v.MaxVariablePrice ?? v.Price)
                    : null,

                TotalVariantStock = o.Variants
                    .Select(v => new { v.ManageStock, v.StockQuantity, v.StockStatus })
                    .Sum(v =>
                        v.ManageStock
                            ? ((v.StockStatus == StockStatus.InStock || v.StockStatus == StockStatus.OnBackorder) ? v.StockQuantity : 0)
                            : ((v.StockStatus == StockStatus.InStock || v.StockStatus == StockStatus.OnBackorder) ? 1 : 0)
                    )
            })
            .ToListAsync(ct);

        // اگر چند DefaultOffer احتمالی دارید، اولی رو بردار
        var offerMap = offers
            .GroupBy(x => x.ProductId)
            .ToDictionary(g => g.Key, g => g.First());

        // 6) Media (primary + gallery)
        var media = await _db.ProductMedia
            .AsNoTracking()
            .Where(pm => ids.Contains(pm.ProductId) && !pm.IsDeleted)
            .Select(pm => new { pm.ProductId, pm.Url, pm.IsPrimary, pm.SortOrder })
            .ToListAsync(ct);

        var primaryImageMap = media
            .GroupBy(m => m.ProductId)
            .ToDictionary(
                g => g.Key,
                g => g.OrderByDescending(x => x.IsPrimary).ThenBy(x => x.SortOrder).Select(x => x.Url).FirstOrDefault()
            );

        var galleryMap = media
            .Where(m => !m.IsPrimary)
            .GroupBy(m => m.ProductId)
            .ToDictionary(
                g => g.Key,
                g => (IReadOnlyList<string>)g.OrderBy(x => x.SortOrder).Select(x => x.Url).ToList()
            );

        // 7) Categories
        var cats = await _db.ProductCategoryAssignments
            .AsNoTracking()
            .Where(a => ids.Contains(a.ProductId))
            .Select(a => new { a.ProductId, a.CatalogCategoryId, a.SortOrder })
            .ToListAsync(ct);

        var catMap = cats
            .GroupBy(x => x.ProductId)
            .ToDictionary(
                g => g.Key,
                g => (IReadOnlyList<Guid>)g.OrderBy(x => x.SortOrder).Select(x => x.CatalogCategoryId).ToList()
            );

        // 8) Tags
        var tags = await _db.ProductTags
            .AsNoTracking()
            .Where(pt => ids.Contains(pt.ProductId))
            .Select(pt => new { pt.ProductId, pt.TagId })
            .ToListAsync(ct);

        var tagMap = tags
            .GroupBy(x => x.ProductId)
            .ToDictionary(
                g => g.Key,
                g => (IReadOnlyList<Guid>)g.Select(x => x.TagId).ToList()
            );

        // 9) Assemble in the same order as paging
        var items = new List<ProductListItemDto>(ids.Count);

        foreach (var row in pageRows)
        {
            if (!prodMap.TryGetValue(row.Id, out var p))
                continue;

            offerMap.TryGetValue(p.Id, out var off);

            primaryImageMap.TryGetValue(p.Id, out var primaryUrl);
            galleryMap.TryGetValue(p.Id, out var gallery);
            catMap.TryGetValue(p.Id, out var catIds);
            tagMap.TryGetValue(p.Id, out var tagIds);

            gallery ??= Array.Empty<string>();
            catIds ??= Array.Empty<Guid>();
            tagIds ??= Array.Empty<Guid>();

            items.Add(new ProductListItemDto(
                p.Id,
                p.Title,
                p.EnglishTitle,
                p.ShortTitle,
                p.Slug,
                p.Sku,
                p.DescriptionHtml,

                p.IsFeatured,
                p.AllowCustomerReviews,
                p.AllowCustomerQuestions,
                p.IsVariantProduct,
                p.Status,
                p.Visibility,

                p.BrandId,
                p.BrandTitle,
                p.OwnerVendorId,
                p.OwnerVendorStoreName,

                p.Seo.MetaTitle,
                p.Seo.MetaDescription,
                p.Seo.Keywords,
                p.Seo.CanonicalUrl,
                p.Seo.SeoMetaRobots,
                p.Seo.SeoSchemaJson,
                p.Seo.AutoGenerateSnippet,
                p.Seo.AutoGenerateHeadTags,
                p.Seo.IncludeInSitemap,

                p.CreatedAtUtc,
                p.UpdatedAtUtc,
                p.IsDeleted,
                Convert.ToBase64String(p.RowVersion),

                off != null ? off.Price : null,
                off != null ? off.DiscountPrice : null,
                off != null ? off.StockQuantity : null,
                off != null ? off.SaleModel : ProductSaleModel.OnlinePricing,

                (decimal?)null, // OldPrice یا هر چیزی که قبلاً null می‌دادید
                off != null && off.ManageStock,
                off != null ? off.StockStatus : StockStatus.InStock,

                p.IsVariantProduct && off != null ? off.MinVariantPrice : null,
                p.IsVariantProduct && off != null ? off.MaxVariantPrice : null,
                p.IsVariantProduct && off != null ? off.TotalVariantStock : null,

                primaryUrl,
                catIds,
                gallery,
                tagIds
            ));
        }

        return Ok(new PagedResult<ProductListItemDto>(items, total, page, pageSize));
    }



    // GET /api/products/trash
    [HttpGet("trash")]
    [RequirePermission("products.trash.view")]
    public async Task<ActionResult<PagedResult<ProductListItemDto>>> Trash(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var userId = GetCurrentUserId();
        var isAdmin = IsAdmin();

        var query = _db.Products
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Include(p => p.Brand)
            .Include(p => p.ProductCategoryAssignments)
                .ThenInclude(a => a.Category)
            .Where(p => p.IsDeleted);

        if (!isAdmin)
        {
            // همه فروشنده‌هایی که این یوزر عضو‌شان است
            var vendorIds = await _db.VendorMembers
                .Where(vm => vm.UserId == userId && vm.IsActive)
                .Select(vm => vm.VendorId)
                .ToListAsync();

            if (!vendorIds.Any())
            {
                return Ok(new PagedResult<ProductListItemDto>([], 0, page, pageSize));
            }

            query = query.Where(p => p.OwnerVendorId.HasValue && vendorIds.Contains(p.OwnerVendorId.Value));
        }

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(p =>
                p.Title.Contains(s) ||
                p.Slug.Contains(s) ||
                (p.Sku != null && p.Sku.Contains(s)));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(p => p.UpdatedAtUtc ?? p.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new
            {
                Product = p,
                DefaultOffer = p.VendorOffers
                    .Where(o => o.IsDefaultForProduct && !o.IsDeleted)
                    .OrderBy(o => o.CreatedAtUtc)
                    .Select(o => new
                    {
                        o.Price,
                        o.DiscountPrice,
                        o.StockQuantity,
                        o.SaleModel,
                        o.ManageStock,
                        o.StockStatus,
                        MinVariantPrice = o.Variants.Any()
                                            ? (decimal?)o.Variants.Min(v => v.MinVariablePrice ?? v.Price)
                                            : null,

                        MaxVariantPrice = o.Variants.Any()
                                            ? (decimal?)o.Variants.Max(v => v.MaxVariablePrice ?? v.Price)
                                            : null,

                        TotalVariantStock = o.Variants.Select(v => v.ManageStock ? (int?)v.StockQuantity
                        : (v.StockStatus == StockStatus.InStock ||
                            v.StockStatus == StockStatus.OnBackorder ? (int?)1 : (int?)0)).Sum()
                    })
                    .FirstOrDefault()
            })
            .Select(x => new ProductListItemDto(
                x.Product.Id,
                    x.Product.Title,
                    x.Product.EnglishTitle,
                    x.Product.ShortTitle,
                    x.Product.Slug,
                    x.Product.Sku,
                    x.Product.DescriptionHtml,
                    x.Product.IsFeatured,
                    x.Product.AllowCustomerReviews,
                    x.Product.AllowCustomerQuestions,
                    x.Product.IsVariantProduct,
                    x.Product.Status,
                    x.Product.Visibility,
                    x.Product.BrandId,
                    x.Product.Brand != null ? x.Product.Brand.Title : null,
                    x.Product.OwnerVendorId,
                    x.Product.OwnerVendor != null ? x.Product.OwnerVendor.StoreName : null,
                    x.Product.Seo.MetaTitle,
                    x.Product.Seo.MetaDescription,
                    x.Product.Seo.Keywords,
                    x.Product.Seo.CanonicalUrl,
                    x.Product.Seo.SeoMetaRobots,
                    x.Product.Seo.SeoSchemaJson,
                    x.Product.Seo.AutoGenerateSnippet,
                    x.Product.Seo.AutoGenerateHeadTags,
                    x.Product.Seo.IncludeInSitemap,
                    x.Product.CreatedAtUtc,
                    x.Product.UpdatedAtUtc,
                    x.Product.IsDeleted,
                    Convert.ToBase64String(x.Product.RowVersion),
                    x.DefaultOffer != null ? x.DefaultOffer.Price : null,
                    x.DefaultOffer != null ? x.DefaultOffer.DiscountPrice : null,
                    x.DefaultOffer != null ? x.DefaultOffer.StockQuantity : null,
                    x.DefaultOffer != null ? x.DefaultOffer.SaleModel : ProductSaleModel.OnlinePricing,
                    (decimal?)null,
                    x.DefaultOffer != null ? x.DefaultOffer.ManageStock : false,
                    x.DefaultOffer != null ? x.DefaultOffer.StockStatus : StockStatus.InStock,
                    x.Product.IsVariantProduct && x.DefaultOffer != null ? x.DefaultOffer.MinVariantPrice : null,
                    x.Product.IsVariantProduct && x.DefaultOffer != null ? x.DefaultOffer.MaxVariantPrice : null,
                    x.Product.IsVariantProduct && x.DefaultOffer != null ? x.DefaultOffer.TotalVariantStock : null,
                    x.Product.ProductMedia
                        .Where(pm => !pm.IsDeleted)
                        .OrderByDescending(pm => pm.IsPrimary)
                        .ThenBy(pm => pm.SortOrder)
                        .Select(pm => pm.Url)
                        .FirstOrDefault(),
                    x.Product.ProductCategoryAssignments
                            .OrderBy(a => a.SortOrder)
                            .Select(a => a.CatalogCategoryId)
                            .ToList(),
                    x.Product.ProductMedia
                            .Where(pm => !pm.IsDeleted && !pm.IsPrimary)
                            .OrderBy(pm => pm.SortOrder)
                            .Select(pm => pm.Url)
                            .ToList(),
                    x.Product.ProductTags.Select(pt => pt.TagId).ToList()
            ))
            .ToListAsync();

        return Ok(new PagedResult<ProductListItemDto>(items, total, page, pageSize));
    }


    // GET /api/products/{id}
    [HttpGet("{id:guid}")]
    [RequirePermission("products.view")]
    public async Task<ActionResult<ProductDto>> Get(Guid id)
    {
        var p = await _db.Products
            .Include(x => x.Brand)
            .Include(x => x.VendorOffers)
            .Include(x => x.ProductMedia)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

        if (p == null) return NotFound();

        var defaultOffer = p.VendorOffers
            .Where(o => o.IsDefaultForProduct && !o.IsDeleted)
            .OrderBy(o => o.CreatedAtUtc)
            .FirstOrDefault();

        var primaryImageUrl = p.ProductMedia
                                .Where(pm => !pm.IsDeleted)
                                .OrderByDescending(pm => pm.IsPrimary)
                                .ThenBy(pm => pm.SortOrder)
                                .Select(pm => pm.Url)
                                .FirstOrDefault();

        var galleryUrls = p.ProductMedia
                            .Where(pm => !pm.IsDeleted && !pm.IsPrimary)
                            .OrderBy(pm => pm.SortOrder)
                            .Select(pm => pm.Url)
                            .ToList();

        var categoryIds = await _db.ProductCategoryAssignments
                                    .Where(x => x.ProductId == id)
                                    .OrderBy(x => x.SortOrder)
                                    .Select(x => x.CatalogCategoryId)
                                    .ToListAsync();

        var dto = new ProductDto(
            p.Id,
            p.Title,
            p.EnglishTitle,
            p.ShortTitle,
            p.Slug,
            p.Sku,
            p.DescriptionHtml,
            p.IsFeatured,
            p.AllowCustomerReviews,
            p.AllowCustomerQuestions,
            p.IsVariantProduct,
            p.Status,
            p.Visibility,
            p.BrandId,
            p.Brand?.Title,
            p.OwnerVendorId,
            p.OwnerVendor?.StoreName,
            p.Seo.MetaTitle,
            p.Seo.MetaDescription,
            p.Seo.Keywords,
            p.Seo.CanonicalUrl,
            p.Seo.SeoMetaRobots,
            p.Seo.SeoSchemaJson,
            p.Seo.AutoGenerateSnippet,
            p.Seo.AutoGenerateHeadTags,
            p.Seo.IncludeInSitemap,
            p.CreatedAtUtc,
            p.UpdatedAtUtc,
            p.IsDeleted,
            Convert.ToBase64String(p.RowVersion),
            defaultOffer?.Price,
            defaultOffer?.DiscountPrice,
            defaultOffer?.StockQuantity,
            defaultOffer?.SaleModel ?? ProductSaleModel.OnlinePricing,
            (decimal?)null,
            primaryImageUrl,
            categoryIds,
            galleryUrls,
            p.ProductTags.Select(pt => pt.TagId).ToList(),
            defaultOffer?.ManageStock,
            defaultOffer?.StockStatus,
            defaultOffer?.BackorderPolicy,
            defaultOffer?.LowStockThreshold
        );

        return Ok(dto);
    }


    // POST /api/products
    [HttpPost]
    [RequirePermission("products.create")]
    public async Task<ActionResult<ProductDto>> Create([FromBody] ProductCreateUpdateDto dto, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var isAdmin = IsAdmin();


        var settings = await _db.StoreSettings
                                .AsNoTracking()
                                .OrderByDescending(x => x.CreatedAtUtc)
                                .FirstOrDefaultAsync();

        Guid ownerVendorId;
        try
        {
            ownerVendorId = await ResolveOwnerVendorIdAsync(dto.OwnerVendorId, isAdmin, userId, ct);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }


        // 3) ساخت Product
        var entity = new Product
        {
            Title = dto.Title,
            EnglishTitle = dto.EnglishTitle,
            ShortTitle = dto.ShortTitle,
            Slug = dto.Slug,
            Sku = dto.Sku,
            DescriptionHtml = dto.DescriptionHtml,

            IsFeatured = dto.IsFeatured,
            AllowCustomerReviews = dto.AllowCustomerReviews,
            AllowCustomerQuestions = dto.AllowCustomerQuestions,
            IsVariantProduct = dto.IsVariantProduct,

            Status = dto.Status,
            Visibility = dto.Visibility,

            BrandId = dto.BrandId,
            OwnerVendorId = ownerVendorId,
        };

        entity.Seo.MetaTitle = dto.SeoTitle;
        entity.Seo.MetaDescription = dto.SeoMetaDescription;
        entity.Seo.Keywords = dto.SeoKeywords;
        entity.Seo.CanonicalUrl = dto.SeoCanonicalUrl;
        entity.Seo.SeoMetaRobots = dto.SeoMetaRobots;
        entity.Seo.SeoSchemaJson = dto.SeoSchemaJson;
        entity.Seo.AutoGenerateSnippet = dto.AutoGenerateSnippet;
        entity.Seo.AutoGenerateHeadTags = dto.AutoGenerateHeadTags;
        entity.Seo.IncludeInSitemap = dto.IncludeInSitemap;

        _db.Products.Add(entity);

        entity.IsVariantProduct = dto.IsVariantProduct;

        // ساخت برچسب ها
        if (dto.TagIds != null && dto.TagIds.Count > 0)
        {
            entity.ProductTags = dto.TagIds
                .Distinct()
                .Select(id => new ProductTag
                {
                    Product = entity,
                    TagId = id
                }).ToList();
        }

        _db.Products.Add(entity);
        await _db.SaveChangesAsync();

        // ساخت VendorOffer پیش‌فرض
        var offer = new VendorOffer
        {
            VendorId = ownerVendorId,
            Product = entity,
            Status = VendorOfferStatus.Approved,
            IsDefaultForProduct = true,
        };

        // محصول ساده → قیمت کلی از dto
        if (!dto.IsVariantProduct)
        {
            offer.Price = dto.Price ?? 0;
            offer.DiscountPrice = dto.DiscountPrice;
            offer.SaleModel = dto.SaleModel;
            offer.ManageStock = dto.ManageStock ?? false;
            if (offer.ManageStock)
            {
                offer.StockQuantity = dto.Stock ?? 0;
                offer.StockStatus = offer.StockQuantity > 0
                    ? StockStatus.InStock
                    : StockStatus.OutOfStock;
            }
            else
            {
                offer.StockQuantity = 0;
                offer.StockStatus = dto.StockStatus ?? StockStatus.InStock;
            }

            offer.BackorderPolicy = dto.BackorderPolicy ?? BackorderPolicy.DoNotAllow;
            offer.LowStockThreshold = dto.LowStockThreshold;
        }
        else
        {
            // محصول متغیر → قیمت کلی ندارد
            offer.Price = 0;
            offer.DiscountPrice = null;
            offer.StockQuantity = 0;
            offer.SaleModel = ProductSaleModel.OnlinePricing;
        }

        _db.Set<VendorOffer>().Add(offer);


        if (dto.CategoryIds != null && dto.CategoryIds.Count > 0)
        {
            var distinctIds = dto.CategoryIds.Distinct().ToList();

            var categories = await _db.CatalogCategories
                .Where(c => distinctIds.Contains(c.Id) && !c.IsDeleted && c.IsActive)
                .ToListAsync();

            int sort = 0;
            foreach (var cat in categories)
            {
                var assign = new ProductCategoryAssignment
                {
                    Product = entity,
                    CatalogCategoryId = cat.Id,
                    IsPrimary = sort == 0,
                    SortOrder = sort++
                };

                _db.Set<ProductCategoryAssignment>().Add(assign);
            }
        }


        if (!string.IsNullOrWhiteSpace(dto.PrimaryImageUrl))
        {
            var media = new ProductMedia
            {
                Product = entity,
                Kind = MediaKind.Image,
                Provider = MediaProvider.Upload,
                Url = dto.PrimaryImageUrl,
                ThumbnailUrl = null,
                AltText = entity.Title,
                SortOrder = 0,
                IsPrimary = true,
            };

            _db.Set<ProductMedia>().Add(media);
        }


        if (dto.GalleryImageUrls != null && dto.GalleryImageUrls.Count > 0)
        {
            int sort = 1;
            foreach (var url in dto.GalleryImageUrls.Where(u => !string.IsNullOrWhiteSpace(u)))
            {
                var media = new ProductMedia
                {
                    Product = entity,
                    Kind = MediaKind.Image,
                    Provider = MediaProvider.Upload,
                    Url = url,
                    ThumbnailUrl = null,
                    AltText = entity.Title,
                    SortOrder = sort++,
                    IsPrimary = false,
                };

                _db.Set<ProductMedia>().Add(media);
            }
        }

        // product variant && offer variant
        if (dto.IsVariantProduct && !string.IsNullOrWhiteSpace(dto.VariantsJson))
        {
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            var variantDtos = JsonSerializer.Deserialize<List<ProductVariantUpsertDto>>(
                dto.VariantsJson,
                jsonOptions
            ) ?? new List<ProductVariantUpsertDto>();

            // دقت کن: اینجا فرض می‌کنیم همون offer پیش‌فرض محصول رو برای همه ویراینت‌ها استفاده می‌کنی
            var defaultOffer = offer; // همون VendorOffer بالا

            foreach (var v in variantDtos)
            {
                // 1) خود ProductVariant
                var variant = new ProductVariant
                {
                    Product = entity
                };

                variant.VariantCode = GenerateVariantCode(entity, v);

                _db.Set<ProductVariant>().Add(variant);

                // 2) اتصال این ویراینت به ویژگی/مقدار (ProductVariantAttributeValue)
                if (v.AttributeId.HasValue && v.OptionId.HasValue)
                {
                    var pav = new ProductVariantAttributeValue
                    {
                        ProductVariant = variant,
                        AttributeId = v.AttributeId.Value,
                        OptionId = v.OptionId.Value,
                        DisplayOrder = 0
                    };

                    _db.Set<ProductVariantAttributeValue>().Add(pav);
                }

                // 3) قیمت و موجودی ویراینت روی VendorOfferVariant
                if (defaultOffer != null && v.Price.HasValue && v.Stock.HasValue)
                {
                    var voVariant = new VendorOfferVariant
                    {
                        VendorOffer = defaultOffer,
                        ProductVariant = variant,
                        Sku = v.Sku,
                        Price = v.Price.Value,
                        StockQuantity = v.Stock.Value,
                        DiscountPrice = v.DiscountPrice
                    };

                    _db.Set<VendorOfferVariant>().Add(voVariant);
                }
            }
        }



        await _db.SaveChangesAsync();
        return await Get(entity.Id);
    }


    [HttpPut("{id:guid}")]
    [RequirePermission("products.update")]
    public async Task<IActionResult> Update(Guid id, [FromBody] ProductCreateUpdateDto dto, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var isAdmin = IsAdmin();

        var product = await _db.Products
            .Include(p => p.VendorOffers)
            .Include(p => p.ProductMedia)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

        if (product == null)
            return NotFound();

        var settings = await _db.StoreSettings.AsNoTracking()
                                            .OrderByDescending(x => x.CreatedAtUtc)
                                            .FirstOrDefaultAsync();

        var multiVendorEnabled = settings?.MultiVendorEnabled ?? true;

        Guid forcedStoreVendorId = Guid.Empty;
        if (!multiVendorEnabled)
        {
            if (!settings!.StoreVendorId.HasValue || settings.StoreVendorId.Value == Guid.Empty)
                return BadRequest("StoreVendorId is not configured.");

            forcedStoreVendorId = settings.StoreVendorId.Value;

            if (dto.OwnerVendorId.HasValue && dto.OwnerVendorId.Value != Guid.Empty)
                return BadRequest("OwnerVendorId is not allowed when MultiVendor is disabled.");
        }

        if (!string.IsNullOrWhiteSpace(dto.RowVersion))
        {
            var original = Convert.FromBase64String(dto.RowVersion);
            _db.Entry(product).Property(x => x.RowVersion).OriginalValue = original;
        }

        // Product fields
        product.Title = dto.Title;
        product.EnglishTitle = dto.EnglishTitle;
        product.ShortTitle = dto.ShortTitle;
        product.Slug = dto.Slug;
        product.Sku = dto.Sku;
        product.DescriptionHtml = dto.DescriptionHtml;
        product.IsFeatured = dto.IsFeatured;
        product.AllowCustomerReviews = dto.AllowCustomerReviews;
        product.AllowCustomerQuestions = dto.AllowCustomerQuestions;
        product.IsVariantProduct = dto.IsVariantProduct;
        product.Status = dto.Status;
        product.Visibility = dto.Visibility;
        product.BrandId = dto.BrandId;


        Guid? newOwnerVendorId;
        if (!multiVendorEnabled)
        {
            newOwnerVendorId = forcedStoreVendorId;
        }
        else
        {
            newOwnerVendorId = dto.OwnerVendorId ?? product.OwnerVendorId;

            if (newOwnerVendorId.HasValue && newOwnerVendorId.Value == Guid.Empty)
                return BadRequest("OwnerVendorId cannot be empty.");

            if (!isAdmin && newOwnerVendorId.HasValue &&
                (!product.OwnerVendorId.HasValue || newOwnerVendorId.Value != product.OwnerVendorId.Value))
            {
                var isNewMember = await IsMemberOfVendorAsync(userId, newOwnerVendorId.Value);
                if (!isNewMember) return Forbid();
            }
        }

        product.OwnerVendorId = newOwnerVendorId;
        product.Seo.MetaTitle = dto.SeoTitle;
        product.Seo.MetaDescription = dto.SeoMetaDescription;
        product.Seo.Keywords = dto.SeoKeywords;
        product.Seo.CanonicalUrl = dto.SeoCanonicalUrl;
        product.Seo.SeoMetaRobots = dto.SeoMetaRobots;
        product.Seo.SeoSchemaJson = dto.SeoSchemaJson;
        product.Seo.AutoGenerateSnippet = dto.AutoGenerateSnippet;
        product.Seo.AutoGenerateHeadTags = dto.AutoGenerateHeadTags;
        product.Seo.IncludeInSitemap = dto.IncludeInSitemap;
        product.UpdatedAtUtc = DateTime.UtcNow;

        var defaultOffer = product.VendorOffers
            .FirstOrDefault(o => o.IsDefaultForProduct && !o.IsDeleted);

        if (defaultOffer == null && newOwnerVendorId.HasValue)
        {
            defaultOffer = new VendorOffer
            {
                VendorId = newOwnerVendorId.Value,
                ProductId = product.Id,
                IsDefaultForProduct = true,
                Status = VendorOfferStatus.Approved,
            };
            _db.Set<VendorOffer>().Add(defaultOffer);
        }

        // فقط اگر محصول ساده است، قیمت کلی را آپدیت کن
        if (!dto.IsVariantProduct && defaultOffer != null)
        {
            defaultOffer.Price = dto.Price ?? 0;
            defaultOffer.DiscountPrice = dto.DiscountPrice;
            defaultOffer.StockQuantity = dto.Stock ?? 0;
            defaultOffer.SaleModel = dto.SaleModel;
            defaultOffer.ManageStock = dto.ManageStock ?? false;
            if (defaultOffer.ManageStock)
            {
                defaultOffer.StockQuantity = dto.Stock ?? 0;
                defaultOffer.StockStatus = defaultOffer.StockQuantity > 0
                    ? StockStatus.InStock
                    : StockStatus.OutOfStock;
            }
            else
            {
                defaultOffer.StockQuantity = 0;
                defaultOffer.StockStatus = dto.StockStatus ?? StockStatus.InStock;
            }
            defaultOffer.BackorderPolicy = dto.BackorderPolicy ?? BackorderPolicy.DoNotAllow;
            defaultOffer.LowStockThreshold = dto.LowStockThreshold;
            defaultOffer.UpdatedAtUtc = DateTime.UtcNow;
        }
        else if (dto.IsVariantProduct && defaultOffer != null)
        {
            defaultOffer.Price = 0;
            defaultOffer.DiscountPrice = null;
            defaultOffer.StockQuantity = 0;
            defaultOffer.SaleModel = ProductSaleModel.OnlinePricing;
        }

        var existingMedia = product.ProductMedia
                                    .Where(pm => !pm.IsDeleted)
                                    .ToList();

        if (string.IsNullOrWhiteSpace(dto.PrimaryImageUrl))
        {
            foreach (var media in existingMedia)
            {
                media.IsDeleted = true;
                media.DeletedAtUtc = DateTime.UtcNow;
            }
        }
        else
        {
            var primaryMedia = existingMedia
                .OrderByDescending(pm => pm.IsPrimary)
                .ThenBy(pm => pm.SortOrder)
                .FirstOrDefault();

            if (primaryMedia == null)
            {
                primaryMedia = new ProductMedia
                {
                    ProductId = product.Id,
                    Kind = MediaKind.Image,
                    Provider = MediaProvider.Upload,
                    Url = dto.PrimaryImageUrl,
                    AltText = product.Title,
                    SortOrder = 0,
                    IsPrimary = true,
                };
                _db.Set<ProductMedia>().Add(primaryMedia);
            }
            else
            {
                primaryMedia.Url = dto.PrimaryImageUrl;
                primaryMedia.AltText = product.Title;
                primaryMedia.IsPrimary = true;
                primaryMedia.UpdatedAtUtc = DateTime.UtcNow;
            }

            if (primaryMedia != null)
                primaryMedia.SortOrder = 0;

        }


        var existingGallery = existingMedia
            .Where(pm => !pm.IsPrimary)
            .ToList();

        // لیست جدید ارسالی از فرم
        var newGalleryUrls = (dto.GalleryImageUrls ?? new List<string>())
            .Where(u => !string.IsNullOrWhiteSpace(u))
            .Distinct()
            .ToList();

        // حذف مواردی که دیگر در لیست جدید نیستند
        foreach (var media in existingGallery.Where(m => !newGalleryUrls.Contains(m.Url)))
        {
            media.IsDeleted = true;
            media.DeletedAtUtc = DateTime.UtcNow;
        }

        // ماکس SortOrder فعلی
        int sortBase = existingMedia
            .Where(pm => !pm.IsDeleted)
            .Select(pm => pm.SortOrder)
            .DefaultIfEmpty(0)
            .Max();

        // اضافه کردن URLهای جدیدی که قبلاً وجود نداشتند
        foreach (var url in newGalleryUrls)
        {
            bool alreadyExists = existingGallery.Any(m => m.Url == url && !m.IsDeleted);
            if (alreadyExists) continue;

            sortBase++;

            var galleryMedia = new ProductMedia
            {
                ProductId = product.Id,
                Kind = MediaKind.Image,
                Provider = MediaProvider.Upload,
                Url = url,
                ThumbnailUrl = null,
                AltText = product.Title,
                SortOrder = sortBase,
                IsPrimary = false,
            };

            _db.Set<ProductMedia>().Add(galleryMedia);
        }



        var newCategoryIds = (dto.CategoryIds ?? new List<Guid>())
            .Where(id => id != Guid.Empty)
            .Distinct()
            .ToList();

        var existingAssignments = await _db.Set<ProductCategoryAssignment>()
            .Where(a => a.ProductId == product.Id)
            .ToListAsync();

        // حذف‌هایی که دیگر در لیست جدید نیستند
        var toRemove = existingAssignments
            .Where(a => !newCategoryIds.Contains(a.CatalogCategoryId))
            .ToList();

        if (toRemove.Count > 0)
            _db.Set<ProductCategoryAssignment>().RemoveRange(toRemove);

        // اضافه‌کردن/آپدیت
        int sort = 0;
        foreach (var catId in newCategoryIds)
        {
            var assignment = existingAssignments
                .FirstOrDefault(a => a.CatalogCategoryId == catId);

            if (assignment == null)
            {
                assignment = new ProductCategoryAssignment
                {
                    ProductId = product.Id,
                    CatalogCategoryId = catId,
                };
                _db.Set<ProductCategoryAssignment>().Add(assignment);
            }

            assignment.SortOrder = sort;
            assignment.IsPrimary = sort == 0;
            sort++;
        }


        product.IsVariantProduct = dto.IsVariantProduct;

        if (!dto.IsVariantProduct)
        {
            var oldVariants = await _db.Set<ProductVariant>()
                .Where(v => v.ProductId == product.Id)
                .Include(v => v.VendorOfferVariants)
                .Include(v => v.AttributeValues)
                .ToListAsync();

            if (oldVariants.Count > 0)
            {
                var voVariants = oldVariants.SelectMany(v => v.VendorOfferVariants).ToList();
                if (voVariants.Count > 0)
                    _db.Set<VendorOfferVariant>().RemoveRange(voVariants);

                var pavs = oldVariants.SelectMany(v => v.AttributeValues).ToList();
                if (pavs.Count > 0)
                    _db.Set<ProductVariantAttributeValue>().RemoveRange(pavs);

                _db.Set<ProductVariant>().RemoveRange(oldVariants);
            }
        }
        else
        {
            var oldVariants = await _db.Set<ProductVariant>()
                .Where(v => v.ProductId == product.Id)
                .Include(v => v.VendorOfferVariants)
                .Include(v => v.AttributeValues)
                .ToListAsync();

            if (oldVariants.Count > 0)
            {
                var voVariants = oldVariants.SelectMany(v => v.VendorOfferVariants).ToList();
                if (voVariants.Count > 0)
                    _db.Set<VendorOfferVariant>().RemoveRange(voVariants);

                var pavs = oldVariants.SelectMany(v => v.AttributeValues).ToList();
                if (pavs.Count > 0)
                    _db.Set<ProductVariantAttributeValue>().RemoveRange(pavs);

                _db.Set<ProductVariant>().RemoveRange(oldVariants);
            }

            if (!string.IsNullOrWhiteSpace(dto.VariantsJson))
            {
                var jsonOptions = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                Console.WriteLine(dto.VariantsJson);

                var variantDtos = JsonSerializer.Deserialize<List<ProductVariantUpsertDto>>(
                    dto.VariantsJson,
                    jsonOptions
                ) ?? new List<ProductVariantUpsertDto>();

                if (defaultOffer == null && product.OwnerVendorId.HasValue)
                {
                    defaultOffer = new VendorOffer
                    {
                        VendorId = product.OwnerVendorId.Value,
                        ProductId = product.Id,
                        IsDefaultForProduct = true,
                        Status = VendorOfferStatus.Approved,
                    };
                    _db.Set<VendorOffer>().Add(defaultOffer);
                }

                foreach (var v in variantDtos)
                {
                    var price = v.Price;
                    var oldPrice = v.DiscountPrice;


                    var variant = new ProductVariant
                    {
                        ProductId = product.Id
                    };

                    variant.VariantCode = GenerateVariantCode(product, v);

                    _db.Set<ProductVariant>().Add(variant);

                    if (v.AttributeId.HasValue && v.OptionId.HasValue)
                    {
                        var pav = new ProductVariantAttributeValue
                        {
                            ProductVariant = variant,
                            AttributeId = v.AttributeId.Value,
                            OptionId = v.OptionId.Value,
                            DisplayOrder = 0
                        };
                        _db.Set<ProductVariantAttributeValue>().Add(pav);
                    }

                    if (defaultOffer != null && v.Price.HasValue && v.Stock.HasValue)
                    {

                        var manageStock = v.ManageStock ?? false;
                        var stockQty = v.Stock ?? 0;
                        StockStatus stockStatus;
                        if (v.StockStatus.HasValue)
                        {
                            stockStatus = (StockStatus)v.StockStatus.Value;
                        }
                        else
                        {
                            if (manageStock)
                            {
                                stockStatus = stockQty > 0 ? StockStatus.InStock : StockStatus.OutOfStock;
                            }
                            else
                            {
                                stockStatus = StockStatus.OutOfStock;
                            }
                        }

                        var voVariant = new VendorOfferVariant
                        {
                            VendorOffer = defaultOffer,
                            ProductVariant = variant,
                            Sku = v.Sku ?? string.Empty,

                            // قیمت‌ها
                            Price = v.Price ?? 0m,
                            DiscountPrice = v.DiscountPrice,
                            MinVariablePrice = v.MinVariablePrice,
                            MaxVariablePrice = v.MaxVariablePrice,

                            // ابعاد و وزن
                            WeightKg = v.WeightKg,
                            LengthCm = v.LengthCm,
                            WidthCm = v.WidthCm,
                            HeightCm = v.HeightCm,

                            // توضیحات
                            Description = v.Description,

                            // محدودیت‌های تعداد
                            MinOrderQuantity = v.MinOrderQuantity ?? 0,
                            MaxOrderQuantity = v.MaxOrderQuantity ?? 0,
                            QuantityStep = v.QuantityStep ?? 1,

                            // موجودی و وضعیت انبار
                            ManageStock = manageStock,
                            StockQuantity = stockQty,
                            StockStatus = stockStatus,

                            BackorderPolicy = (BackorderPolicy)(v.BackorderPolicy ?? 0),
                            LowStockThreshold = v.LowStockThreshold
                        };
                        _db.Set<VendorOfferVariant>().Add(voVariant);
                    }
                }
            }
        }

       // مدیریت برچسب‌ها (حذف قبلی‌ها + اضافه‌کردن فقط موارد جدید)
        var newTagIds = (dto.TagIds ?? new List<Guid>())
            .Where(id => id != Guid.Empty)
            .Distinct()
            .ToList();

        // تگ‌های فعلی محصول
        var existingTags = await _db.ProductTags
            .Where(pt => pt.ProductId == product.Id)
            .ToListAsync();

        var existingTagIds = existingTags.Select(pt => pt.TagId).ToList();

        // تگ‌هایی که باید حذف شوند (دیگر در dto نیستند)
        var tagsToRemove = existingTags
            .Where(pt => !newTagIds.Contains(pt.TagId))
            .ToList();

        if (tagsToRemove.Count > 0)
            _db.ProductTags.RemoveRange(tagsToRemove);

        // تگ‌هایی که جدیدند و قبلاً برای این محصول ثبت نشده‌اند
        var tagsToAdd = newTagIds
            .Where(id => !existingTagIds.Contains(id))
            .Select(id => new ProductTag
            {
                ProductId = product.Id,
                TagId = id
            })
            .ToList();

        if (tagsToAdd.Count > 0)
            _db.ProductTags.AddRange(tagsToAdd);



        await _db.SaveChangesAsync();
        return NoContent();
    }


    // DELETE /api/products/{id} – Soft delete
    [HttpDelete("{id:guid}")]
    [RequirePermission("products.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetCurrentUserId();
        var isAdmin = IsAdmin();

        var p = await _db.Products.FirstOrDefaultAsync(x => x.Id == id);
        if (p == null) return NotFound();

        if (!isAdmin)
        {
            if (!p.OwnerVendorId.HasValue)
                return Forbid();

            var isMember = await IsMemberOfVendorAsync(userId, p.OwnerVendorId.Value);
            if (!isMember) return Forbid();
        }

        p.IsDeleted = true;
        p.DeletedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }


    // POST /api/products/{id}/restore
    [HttpPost("{id:guid}/restore")]
    [RequirePermission("products.restore")]
    public async Task<IActionResult> Restore(Guid id)
    {
        var userId = GetCurrentUserId();
        var isAdmin = IsAdmin();

        var product = await _db.Products
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null) return NotFound();
        if (!product.IsDeleted) return BadRequest("این محصول حذف نشده است");

        if (!isAdmin)
        {
            if (!product.OwnerVendorId.HasValue)
                return Forbid();

            var isMember = await IsMemberOfVendorAsync(userId, product.OwnerVendorId.Value);
            if (!isMember) return Forbid();
        }

        product.IsDeleted = false;
        product.DeletedAtUtc = null;
        product.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }


    // DELETE /api/products/{id}/hard
    [HttpDelete("{id:guid}/hard")]
    [RequirePermission("products.hardDelete")]
    public async Task<IActionResult> HardDelete(Guid id)
    {
        var userId = GetCurrentUserId();
        var isAdmin = IsAdmin();

        var product = await _db.Products
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null) return NotFound();

        if (!isAdmin)
        {
            if (!product.OwnerVendorId.HasValue)
                return Forbid();

            var isMember = await IsMemberOfVendorAsync(userId, product.OwnerVendorId.Value);
            if (!isMember) return Forbid();
        }

        _db.Products.Remove(product);
        await _db.SaveChangesAsync();

        return NoContent();
    }


    // GET: /api/products/{id}/variant-attributes
    [HttpGet("{id:guid}/variant-attributes")]
    [RequirePermission("products.view")]
    public async Task<ActionResult<List<VariantAttributeValueDto>>> GetVariantAttributes(Guid id)
    {
        var items = await _db.ProductAttributeValues
            .Where(v =>
                v.ProductId == id &&
                !v.IsDeleted &&
                v.OptionId.HasValue
            )
            .Include(v => v.Attribute)
            .Include(v => v.Option)
            .Select(v => new VariantAttributeValueDto(
                v.AttributeId,
                v.Attribute.Name,
                v.OptionId.Value,
                string.IsNullOrEmpty(v.Option!.DisplayLabel) ? v.Option.Value : v.Option.DisplayLabel
            ))
            .ToListAsync();

        return Ok(items);
    }


    [HttpGet("{id:guid}/variants")]
    [RequirePermission("products.view")]
    public async Task<ActionResult<List<ProductVariantDetailDto>>> GetVariants(Guid id)
    {
        var variants = await _db.Set<ProductVariant>()
                .Where(v => v.ProductId == id)
                .Include(v => v.AttributeValues)
                    .ThenInclude(av => av.Attribute)
                .Include(v => v.AttributeValues)
                    .ThenInclude(av => av.Option)
                .Include(v => v.VendorOfferVariants)
                .ToListAsync();

        var result = variants.Select(v =>
        {
            var attrValue = v.AttributeValues.FirstOrDefault();
            var offerVariant = v.VendorOfferVariants.FirstOrDefault();

            return new ProductVariantDetailDto(
                v.Id,

                attrValue?.AttributeId,
                attrValue?.OptionId,

                offerVariant?.Sku,
                offerVariant?.Price,
                offerVariant?.DiscountPrice,

                offerVariant?.MinVariablePrice,
                offerVariant?.MaxVariablePrice,

                offerVariant?.WeightKg,
                offerVariant?.LengthCm,
                offerVariant?.WidthCm,
                offerVariant?.HeightCm,

                offerVariant?.Description,

                offerVariant?.MinOrderQuantity,
                offerVariant?.MaxOrderQuantity,
                offerVariant?.QuantityStep,

                offerVariant?.StockQuantity,
                offerVariant?.ManageStock,
                offerVariant?.StockStatus,
                offerVariant?.BackorderPolicy,
                offerVariant?.LowStockThreshold
            );
        }).ToList();

        return Ok(result);
    }


    private async Task<Guid> ResolveOwnerVendorIdAsync(
    Guid? requestedOwnerVendorId,
    bool isAdmin,
    Guid userId,
    CancellationToken ct)
    {
        var settings = await _db.StoreSettings
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);

        // single-vendor
        if (settings != null && !settings.MultiVendorEnabled)
        {
            if (!settings.StoreVendorId.HasValue || settings.StoreVendorId.Value == Guid.Empty)
                throw new InvalidOperationException("StoreVendorId is not configured.");

            // اگر کاربر چیزی فرستاده باشد، یعنی دارد فروشنده انتخاب می‌کند (که نباید بتواند)
            if (requestedOwnerVendorId.HasValue && requestedOwnerVendorId.Value != Guid.Empty)
                throw new InvalidOperationException("OwnerVendorId is not allowed when MultiVendor is disabled.");

            // همیشه فروشنده پیش‌فرض فروشگاه
            return settings.StoreVendorId.Value;
        }

        // multi-vendor روشن است
        if (!requestedOwnerVendorId.HasValue || requestedOwnerVendorId.Value == Guid.Empty)
            throw new InvalidOperationException("OwnerVendorId is required.");

        var ownerVendorId = requestedOwnerVendorId.Value;

        if (!isAdmin)
        {
            var isMember = await IsMemberOfVendorAsync(userId, ownerVendorId);
            if (!isMember) throw new UnauthorizedAccessException("User is not member of this vendor.");
        }

        return ownerVendorId;
    }


}