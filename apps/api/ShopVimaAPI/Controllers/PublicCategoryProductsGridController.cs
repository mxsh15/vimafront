using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Category;
using ShopVima.Domain.Enums;
using ShopVima.Infrastructure.Persistence;

namespace ShopVima.API.Controllers.Public;

[ApiController]
[Route("api/public/category-products-grid")]
public sealed class PublicCategoryProductsGridController : ControllerBase
{
    private readonly ShopDbContext _db;
    public PublicCategoryProductsGridController(ShopDbContext db) => _db = db;


    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<CategoryProductsGridDto>>> Get(
        [FromQuery] int take = 4,
        [FromQuery] List<Guid>? categoryIds = null
    )
    {
        take = Math.Clamp(take, 1, 8);

        var ids = (categoryIds ?? new())
            .Where(x => x != Guid.Empty)
            .Distinct()
            .Take(4)
            .ToList();

        if (ids.Count == 0)
            return Ok(new List<CategoryProductsGridDto>());

        // دسته‌بندی‌ها (فقط همون‌هایی که خواستن)
        var cats = await _db.CatalogCategories
            .AsNoTracking()
            .Where(c => !c.IsDeleted)
            .Where(c => ids.Contains(c.Id))
            .Select(c => new { c.Id, c.Title, c.Slug })
            .ToListAsync();

        // حفظ ترتیب ورودی
        var catById = cats.ToDictionary(x => x.Id, x => x);

        var result = new List<CategoryProductsGridDto>(ids.Count);

        foreach (var catId in ids)
        {
            if (!catById.TryGetValue(catId, out var cat))
            {
                // اگر دسته‌ای پیدا نشد، ردش کن
                continue;
            }

            var items = await _db.Products
                .AsNoTracking()
                .Where(p => !p.IsDeleted && p.Status == ProductStatus.Published)
                .Where(p => p.ProductCategoryAssignments.Any(a => a.CatalogCategoryId == catId))
                .OrderByDescending(p => p.CreatedAtUtc)
                .Take(take)
                .Select(p => new CategoryProductCardDto(
                    p.Id,
                    p.Title,
                    p.Slug,
                    p.ProductMedia
                        .OrderByDescending(m => m.IsPrimary)
                        .ThenBy(m => m.SortOrder)
                        .Select(m => m.Url)
                        .FirstOrDefault()
                ))
                .ToListAsync();

            result.Add(new CategoryProductsGridDto(
                cat.Id,
                cat.Title,
                cat.Slug,
                items
            ));
        }

        return Ok(result);
    }
}
