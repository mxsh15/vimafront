using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Product;
using ShopVima.Domain.Enums;
using ShopVima.Infrastructure.Persistence;

[ApiController]
[Route("api/public/amazing-products")]
public sealed class PublicAmazingProductsController : ControllerBase
{
    private readonly ShopDbContext _db;
    public PublicAmazingProductsController(ShopDbContext db) => _db = db;

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<PublicAmazingProductDto>>> List(
        [FromQuery] int take = 20,
        [FromQuery] List<Guid>? categoryIds = null
    )
    {
        take = Math.Clamp(take, 1, 50);

        var q = _db.Products
            .AsNoTracking()
            .Where(p =>
                !p.IsDeleted &&
                p.Status == ProductStatus.Published
            );

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
                p.Slug,
                p.Title,

                ImageUrl = p.ProductMedia
                    .OrderByDescending(m => m.IsPrimary)
                    .ThenBy(m => m.SortOrder)
                    .Select(m => m.Url)
                    .FirstOrDefault(),

                BestOffer = p.VendorOffers
                    .Where(o => !o.IsDeleted)
                    .Where(o => o.Price > 0)
                    .Where(o =>
                        o.DiscountPrice.HasValue &&
                        o.DiscountPrice.Value > 0 &&
                        o.DiscountPrice.Value < o.Price
                    )
                    .OrderByDescending(o => (o.Price - o.DiscountPrice!.Value) * 100m / o.Price)
                    .ThenBy(o => o.DiscountPrice)
                    .Select(o => new
                    {
                        o.Price,
                        o.DiscountPrice,
                        DiscountPercent = (o.Price - o.DiscountPrice!.Value) * 100m / o.Price
                    })
                    .FirstOrDefault()
            })
            .Where(x => x.BestOffer != null)
            .Where(x => x.Slug != null && x.Slug != "")
            .OrderByDescending(x => x.BestOffer!.DiscountPercent)
            .ThenByDescending(x => x.Id)
            .Take(take)
            .Select(x => new PublicAmazingProductDto(
                x.Id,
                x.Slug!,
                x.Title,
                x.ImageUrl,
                x.BestOffer!.Price,
                x.BestOffer!.DiscountPrice,
                (int?)Math.Round(
                    x.BestOffer!.DiscountPercent,
                    0,
                    MidpointRounding.AwayFromZero
                )
            ))
            .ToListAsync();

        return Ok(items);
    }


}
