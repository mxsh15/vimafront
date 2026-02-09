using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.ProductCategory;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Domain.Enums;
using ShopVima.Infrastructure.Persistence;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/store")]
public class PublicStoreController : ControllerBase
{
    private readonly ShopDbContext _db;

    public PublicStoreController(ShopDbContext db)
    {
        _db = db;
    }

    [HttpGet("products")]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResult<object>>> ListProducts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 12;

        var query = _db.Products
            .AsNoTracking()
            .Where(p => !p.IsDeleted && p.Status == ProductStatus.Published);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(p => p.Title.Contains(s));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(p => p.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new
            {
                id = p.Id,
                title = p.Title,
                slug = p.Slug,

                primaryImageUrl = p.ProductMedia
                    .Where(pm => !pm.IsDeleted)
                    .OrderByDescending(pm => pm.IsPrimary)
                    .ThenBy(pm => pm.SortOrder)
                    .Select(pm => pm.Url)
                    .FirstOrDefault(),

                minPrice = p.VendorOffers
                    .Where(o => !o.IsDeleted)
                    .Where(o => o.Price > 0)
                    .Select(o =>
                        (o.DiscountPrice.HasValue && o.DiscountPrice.Value > 0 && o.DiscountPrice.Value < o.Price)
                            ? o.DiscountPrice.Value
                            : o.Price)
                    .OrderBy(x => x)
                    .FirstOrDefault()
            })
            .ToListAsync();

        return Ok(new PagedResult<object>(items, total, page, pageSize));
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<object>> Get(Guid id)
    {
        var product = await _db.Products
            .AsNoTracking()
            .Include(p => p.Brand)
            .Include(p => p.ProductMedia)
            .Include(p => p.Features)
            .Include(p => p.ProductCategoryAssignments)
                .ThenInclude(x => x.Category)
            .Include(p => p.AttributeValues)
                .ThenInclude(x => x.Attribute)
            .Include(p => p.AttributeValues)
                .ThenInclude(x => x.Option)
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

        if (product == null) return NotFound();

        var settings = await _db.StoreSettings
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync();

        var storeVendorId = (settings != null && !settings.MultiVendorEnabled)
            ? settings.StoreVendorId
            : null;

        var offers = await _db.VendorOffers
            .AsNoTracking()
            .Where(o => o.ProductId == id && !o.IsDeleted && (storeVendorId == null || o.VendorId == storeVendorId.Value))
            .Select(o => new
            {
                id = o.Id,
                vendorId = o.VendorId,
                vendorName = o.Vendor.StoreName,
                price = o.Price,
                discountPrice = o.DiscountPrice,
                manageStock = o.ManageStock,
                stockQuantity = o.StockQuantity,
                status = o.Status,
                isDeleted = o.IsDeleted
            })
            .ToListAsync();

        var gallery = product.ProductMedia
            .Where(pm => !pm.IsDeleted)
            .OrderByDescending(pm => pm.IsPrimary)
            .ThenBy(pm => pm.SortOrder)
            .Select(pm => pm.Url)
            .ToList();

        var primaryImageUrl = gallery.FirstOrDefault();

        static string SpecValue(ProductAttributeValue av)
        {
            if (av.Option != null) return av.Option.Value;
            if (!string.IsNullOrWhiteSpace(av.RawValue)) return av.RawValue;
            if (av.BoolValue.HasValue) return av.BoolValue.Value ? "بله" : "خیر";
            if (av.NumericValue.HasValue) return av.NumericValue.Value.ToString();
            if (av.DateTimeValue.HasValue) return av.DateTimeValue.Value.ToString("yyyy-MM-dd");
            return "";
        }

        return Ok(new
        {
            id = product.Id,
            title = product.Title,
            slug = product.Slug,
            sku = product.Sku,
            brandTitle = product.Brand != null ? product.Brand.Title : null,

            ratingAverage = product.RatingAverage,
            ratingCount = product.RatingCount,
            reviewCount = product.ReviewCount,
            questionCount = product.QuestionCount,

            descriptionHtml = product.DescriptionHtml,
            primaryImageUrl,
            galleryImageUrls = gallery,

            categoryIds = product.ProductCategoryAssignments
                .Select(x => x.CatalogCategoryId)
                .ToList(),

            features = product.Features
                .Where(f => !f.IsDeleted)
                .OrderBy(f => f.SortOrder)
                .Select(f => new { title = f.Title, value = f.Value })
                .ToList(),

            specs = product.AttributeValues
                .Where(av => !av.IsDeleted)
                .OrderBy(av => av.DisplayOrder)
                .Select(av => new
                {
                    title = av.Attribute != null ? av.Attribute.Name : "",
                    value = SpecValue(av)
                })
                .Where(x => x.title != "" && x.value != "")
                .ToList(),

            vendorOffers = offers
        });
    }

    [HttpGet("by-slug/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<object>> GetBySlug(string slug)
    {
        var raw = (slug ?? "").Trim();
        if (string.IsNullOrWhiteSpace(raw)) return NotFound();

        var decoded = Uri.UnescapeDataString(raw).Trim();

        static string NormalizeFaSlug(string s)
        {
            if (string.IsNullOrWhiteSpace(s)) return "";
            s = s.Trim();
            s = s.Replace('ي', 'ی').Replace('ك', 'ک');
            s = s.Replace("\u200c", "-").Replace(" ", "-");
            while (s.Contains("--")) s = s.Replace("--", "-");
            return s.Trim('-');
        }

        var normalized = NormalizeFaSlug(decoded);
        var encoded = Uri.EscapeDataString(decoded);

        var candidates = new[] { decoded, normalized, raw, encoded }
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct()
            .ToList();

        var product = await _db.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => !p.IsDeleted && candidates.Contains(p.Slug));

        if (product == null) return NotFound();

        // --- categories (assignments) ---
        var assignments = await _db.Set<ShopVima.Domain.Entities.ProductCategoryAssignment>()
            .AsNoTracking()
            .Where(x => x.ProductId == product.Id)
            .Select(x => new { x.CatalogCategoryId, x.IsPrimary, x.SortOrder })
            .ToListAsync();

        var categoryIds = assignments
            .Select(x => x.CatalogCategoryId)
            .Distinct()
            .ToList();

        Guid? primaryCategoryId = assignments
            .OrderByDescending(x => x.IsPrimary)
            .ThenBy(x => x.SortOrder)
            .Select(x => (Guid?)x.CatalogCategoryId)
            .FirstOrDefault();

        // همه مسیرها
        var categoryBreadcrumbs = new List<List<CategoryBreadcrumbItemDto>>();

        foreach (var cid in categoryIds)
        {
            var path = await BuildCategoryPath(cid);
            if (path.Count > 0)
                categoryBreadcrumbs.Add(path);
        }

        // (اختیاری) حذف مسیرهای تکراری
        categoryBreadcrumbs = categoryBreadcrumbs
            .GroupBy(p => string.Join(">", p.Select(x => x.Id)))
            .Select(g => g.First())
            .ToList();

        // --- build breadcrumb path from primary category up to root ---
        var breadcrumb = new List<CategoryBreadcrumbItemDto>();
        var currentId = primaryCategoryId;

        while (currentId.HasValue)
        {
            var c = await _db.CatalogCategories
                .AsNoTracking()
                .Where(x => x.Id == currentId.Value && !x.IsDeleted)
                .Select(x => new { x.Id, x.Title, x.Slug, x.ParentId })
                .FirstOrDefaultAsync();

            if (c == null) break;

            breadcrumb.Insert(0, new CategoryBreadcrumbItemDto(c.Id, c.Title, c.Slug));
            currentId = c.ParentId;
        }

        // --- settings for multi-vendor logic (your existing code) ---
        var settings = await _db.StoreSettings
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync();

        var storeVendorId = (settings != null && !settings.MultiVendorEnabled)
            ? settings.StoreVendorId
            : null;

        var offers = await _db.VendorOffers
            .AsNoTracking()
            .Where(o =>
                o.ProductId == product.Id &&
                !o.IsDeleted &&
                (storeVendorId == null || o.VendorId == storeVendorId.Value))
            .Select(o => new
            {
                id = o.Id,
                vendorId = o.VendorId,
                vendorName = o.Vendor.StoreName,
                price = o.Price,
                discountPrice = o.DiscountPrice,
                manageStock = o.ManageStock,
                stockQuantity = o.StockQuantity,
                status = o.Status,
                isDeleted = o.IsDeleted
            })
            .ToListAsync();

        var gallery = await _db.Set<ProductMedia>()
            .AsNoTracking()
            .Where(pm => pm.ProductId == product.Id && !pm.IsDeleted)
            .OrderByDescending(pm => pm.IsPrimary)
            .ThenBy(pm => pm.SortOrder)
            .Select(pm => pm.Url)
            .ToListAsync();

        var primaryImageUrl = gallery.FirstOrDefault();

        return Ok(new
        {
            id = product.Id,
            title = product.Title,
            slug = product.Slug,
            sku = product.Sku,
            descriptionHtml = product.DescriptionHtml,

            primaryImageUrl,
            galleryImageUrls = gallery,

            categoryIds,
            primaryCategoryId,
            categoryBreadcrumbs,

            vendorOffers = offers
        });
    }

    private async Task<List<CategoryBreadcrumbItemDto>> BuildCategoryPath(Guid leafCategoryId)
    {
        var path = new List<CategoryBreadcrumbItemDto>();
        Guid? cur = leafCategoryId;

        while (cur.HasValue)
        {
            var c = await _db.CatalogCategories
                .AsNoTracking()
                .Where(x => x.Id == cur.Value && !x.IsDeleted)
                .Select(x => new { x.Id, x.Title, x.Slug, x.ParentId })
                .FirstOrDefaultAsync();

            if (c == null) break;

            path.Insert(0, new CategoryBreadcrumbItemDto(c.Id, c.Title, c.Slug));
            cur = c.ParentId;
        }

        return path;
    }
}
