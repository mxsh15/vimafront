using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Domain.Enums;
using ShopVima.Infrastructure.Persistence;

[ApiController]
[Route("api/public/best-selling-products")]
public sealed class PublicBestSellingProductsController : ControllerBase
{
    private readonly ShopDbContext _db;
    public PublicBestSellingProductsController(ShopDbContext db) => _db = db;

    public sealed record PublicBestSellingProductDto(
        Guid Id,
        string Title,
        string Slug,
        string? ImageUrl,
        int SoldQuantity
    );

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<PublicBestSellingProductDto>>> List([FromQuery] int take = 18)
    {
        take = Math.Clamp(take, 1, 50);

        var validStatuses = new[] { OrderStatus.Processing, OrderStatus.Shipped, OrderStatus.Delivered };

        var top = await _db.OrderItems
            .AsNoTracking()
            .Where(oi => !oi.IsDeleted)
            .Where(oi => !oi.Order.IsDeleted)
            .Where(oi => validStatuses.Contains(oi.Order.Status))
            .GroupBy(oi => oi.ProductId)
            .Select(g => new
            {
                ProductId = g.Key,
                Sold = g.Sum(x => x.Quantity)
            })
            .OrderByDescending(x => x.Sold)
            .Take(take)
            .ToListAsync();

        if (top.Count == 0) return new List<PublicBestSellingProductDto>();

        var ids = top.Select(x => x.ProductId).ToList();
        var byIdOrder = top.Select((x, idx) => new { x.ProductId, idx, x.Sold })
                           .ToDictionary(x => x.ProductId, x => (x.idx, x.Sold));

        var products = await _db.Products
            .AsNoTracking()
            .Where(p => !p.IsDeleted && ids.Contains(p.Id))
            .Select(p => new
            {
                p.Id,
                p.Title,
                p.Slug,
                ImageUrl = p.ProductMedia
                    .OrderByDescending(m => m.IsPrimary)
                    .ThenBy(m => m.SortOrder)
                    .Select(m => m.Url)
                    .FirstOrDefault()
            })
            .ToListAsync();

        var ordered = products
            .OrderBy(p => byIdOrder[p.Id].Item1)
            .Select(p => new PublicBestSellingProductDto(
                p.Id,
                p.Title,
                p.Slug,
                p.ImageUrl,
                byIdOrder[p.Id].Item2
            ))
            .ToList();

        return ordered;
    }
}
