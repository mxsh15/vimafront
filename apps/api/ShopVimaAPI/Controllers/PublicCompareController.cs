using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Compare;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Domain.Enums;
using ShopVima.Infrastructure.Persistence;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/store")]
public class PublicCompareController : ControllerBase
{
    private readonly ShopDbContext _db;

    public PublicCompareController(ShopDbContext db)
    {
        _db = db;
    }

    [HttpGet("products/by-category/{categoryId:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResult<object>>> ListProductsByCategory(
        Guid categoryId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 12;

        var query = _db.Products
            .AsNoTracking()
            .Where(p => !p.IsDeleted && p.Status == ProductStatus.Published)
            .Where(p => p.ProductCategoryAssignments.Any(a => a.CatalogCategoryId == categoryId));

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

    [HttpPost("compare")]
    [AllowAnonymous]
    public async Task<ActionResult<PublicCompareResponseDto>> Compare([FromBody] CompareRequestDto req)
    {
        var ids = (req.ProductIds ?? new List<Guid>())
            .Where(x => x != Guid.Empty)
            .Distinct()
            .Take(4)
            .ToList();

        if (ids.Count == 0)
            return Ok(new PublicCompareResponseDto(new(), new()));

        // محصولات (حفظ ترتیب ورودی)
        var productRows = await _db.Products
            .AsNoTracking()
            .Where(p => ids.Contains(p.Id) && !p.IsDeleted && p.Status == ProductStatus.Published)
            .Select(p => new
            {
                p.Id,
                p.Title,
                p.Slug,
                PrimaryImageUrl = p.ProductMedia
                    .Where(pm => !pm.IsDeleted)
                    .OrderByDescending(pm => pm.IsPrimary)
                    .ThenBy(pm => pm.SortOrder)
                    .Select(pm => pm.Url)
                    .FirstOrDefault(),
                MinPrice = p.VendorOffers
                    .Where(o => !o.IsDeleted)
                    .Where(o => o.Price > 0)
                    .Select(o =>
                        (o.DiscountPrice.HasValue && o.DiscountPrice.Value > 0 && o.DiscountPrice.Value < o.Price)
                            ? o.DiscountPrice.Value
                            : o.Price)
                    .OrderBy(x => x)
                    .Select(x => (decimal?)x)
                    .FirstOrDefault()
            })
            .ToListAsync();

        var products = ids
            .Select(id => productRows.FirstOrDefault(x => x.Id == id))
            .Where(x => x != null)
            .Select(x => new CompareProductDto(
                x!.Id,
                x.Title,
                x.Slug,
                x.PrimaryImageUrl,
                x.MinPrice
            ))
            .ToList();

        if (products.Count == 0)
            return Ok(new PublicCompareResponseDto(new(), new()));

        static string ValueOf(ProductAttributeValue av)
        {
            if (av.Option != null) return av.Option.Value;
            if (!string.IsNullOrWhiteSpace(av.RawValue)) return av.RawValue;
            if (av.BoolValue.HasValue) return av.BoolValue.Value ? "بله" : "خیر";
            if (av.NumericValue.HasValue) return av.NumericValue.Value.ToString();
            if (av.DateTimeValue.HasValue) return av.DateTimeValue.Value.ToString("yyyy-MM-dd");
            return "";
        }

        // فقط ویژگی‌های قابل مقایسه
        var vals = await _db.Set<ProductAttributeValue>()
            .AsNoTracking()
            .Where(v => ids.Contains(v.ProductId) && !v.IsDeleted)
            .Where(v => v.Attribute != null && !v.Attribute.IsDeleted)
            .Select(v => new
            {
                v.ProductId,
                v.AttributeId,
                AttributeTitle = v.Attribute.Name,
                Unit = v.Attribute.Unit,
                AttrSort = v.Attribute.SortOrder,

                GroupTitle = v.Attribute.AttributeGroup != null ? v.Attribute.AttributeGroup.Name : "مشخصات",
                GroupSort = v.Attribute.AttributeGroup != null ? v.Attribute.AttributeGroup.SortOrder : 999999,

                v.DisplayOrder,

                Value = v.Option != null
                    ? v.Option.Value
                    : !string.IsNullOrWhiteSpace(v.RawValue)
                        ? v.RawValue
                        : v.BoolValue.HasValue
                            ? (v.BoolValue.Value ? "بله" : "خیر")
                            : v.NumericValue.HasValue
                                ? v.NumericValue.Value.ToString()
                                : v.DateTimeValue.HasValue
                                    ? v.DateTimeValue.Value.ToString("yyyy-MM-dd")
                                    : ""
            })
            .ToListAsync();

        // group -> attribute -> values per product
        var sections = vals
            .GroupBy(x => new { x.GroupTitle, x.GroupSort })
            .OrderBy(g => g.Key.GroupSort)
            .ThenBy(g => g.Key.GroupTitle)
            .Select(g =>
            {
                var rows = g
                    .GroupBy(x => new { x.AttributeId, x.AttributeTitle, x.Unit, x.AttrSort })
                    .OrderBy(gg => gg.Key.AttrSort)
                    .ThenBy(gg => gg.Key.AttributeTitle)
                    .Select(gg =>
                    {
                        var values = products.Select(p =>
                        {
                            var v = gg
                                .Where(x => x.ProductId == p.Id)
                                .OrderBy(x => x.DisplayOrder)
                                .Select(x => x.Value)
                                .FirstOrDefault();

                            return string.IsNullOrWhiteSpace(v) ? null : v;
                        }).ToList();

                        return new CompareRowDto(gg.Key.AttributeTitle, gg.Key.Unit, values);
                    })
                    .ToList();

                return new CompareSectionDto(g.Key.GroupTitle, rows);
            })
            .Where(s => s.Rows.Count > 0)
            .ToList();

        return Ok(new PublicCompareResponseDto(products, sections));
    }
}