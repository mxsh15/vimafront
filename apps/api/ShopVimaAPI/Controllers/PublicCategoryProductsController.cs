using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Product;
using ShopVima.Domain.Enums;
using ShopVima.Infrastructure.Persistence;

[ApiController]
[Route("api/public/category-products")]
public sealed class PublicCategoryProductsController : ControllerBase
{
    private readonly ShopDbContext _db;
    public PublicCategoryProductsController(ShopDbContext db) => _db = db;

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<PublicCategoryProductDto>>> List(
        [FromQuery] int take = 12,
        [FromQuery] List<Guid>? categoryIds = null
    )
    {
        take = Math.Clamp(take, 1, 50);

        var q = _db.Products
            .AsNoTracking()
            .Where(p => !p.IsDeleted && p.Status == ProductStatus.Published);

        if (categoryIds is { Count: > 0 })
        {
            q = q.Where(p =>
                p.ProductCategoryAssignments.Any(a => categoryIds.Contains(a.CatalogCategoryId))
            );
        }

        var items = await q
            .Select(p => new
            {
                p.Id,
                p.Title,
                p.Slug,
                p.CreatedAtUtc,

                ImageUrl = p.ProductMedia
                    .OrderByDescending(m => m.IsPrimary)
                    .ThenBy(m => m.SortOrder)
                    .Select(m => m.Url)
                    .FirstOrDefault(),

                BestOffer = p.VendorOffers
                    .Where(o => !o.IsDeleted)
                    .Where(o => o.Price > 0)
                    .Select(o => new
                    {
                        o.Price,
                        o.DiscountPrice,
                        HasDiscount = o.DiscountPrice.HasValue
                                      && o.DiscountPrice.Value > 0
                                      && o.DiscountPrice.Value < o.Price,

                        FinalPrice = (o.DiscountPrice.HasValue
                                      && o.DiscountPrice.Value > 0
                                      && o.DiscountPrice.Value < o.Price)
                                    ? o.DiscountPrice.Value
                                    : o.Price,

                        DiscountPercent = (o.DiscountPrice.HasValue
                                           && o.DiscountPrice.Value > 0
                                           && o.DiscountPrice.Value < o.Price)
                                        ? (o.Price - o.DiscountPrice.Value) * 100m / o.Price
                                        : (decimal?)null
                    })
                    .OrderBy(x => x.FinalPrice)
                    .FirstOrDefault()
            })
            .OrderByDescending(x => x.CreatedAtUtc)
            .ThenByDescending(x => x.Id)
            .Take(take)
            .Select(x => new PublicCategoryProductDto(
                x.Id,
                x.Title,
                x.Slug,
                x.ImageUrl,
                x.BestOffer != null ? x.BestOffer.FinalPrice : 0m,
                (x.BestOffer != null && x.BestOffer.HasDiscount) ? x.BestOffer.Price : (decimal?)null,
                (x.BestOffer != null && x.BestOffer.HasDiscount)
                    ? (int?)Math.Round(x.BestOffer.DiscountPercent ?? 0m, 0, MidpointRounding.AwayFromZero)
                    : null
            ))
            .ToListAsync();

        return Ok(items);
    }
}
