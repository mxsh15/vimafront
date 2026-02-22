using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Wishlist;
using ShopVima.Domain.Entities;
using ShopVima.Domain.Enums;
using ShopVima.Infrastructure.Persistence;
using System.Security.Claims;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/wishlists")]
[Authorize]
public class WishlistsController : ControllerBase
{
    private readonly ShopDbContext _db;

    public WishlistsController(ShopDbContext db)
    {
        _db = db;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private async Task<Wishlist> GetOrCreateDefaultWishlist(Guid userId, bool saveNow = true)
    {
        var w = await _db.Wishlists
            .FirstOrDefaultAsync(x => x.UserId == userId && x.IsDefault && !x.IsDeleted);

        if (w != null) return w;

        w = new Wishlist
        {
            UserId = userId,
            IsDefault = true,
            Name = null,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow,
            IsDeleted = false,
        };

        _db.Wishlists.Add(w);

        if (saveNow)
            await _db.SaveChangesAsync();

        return w;
    }


    [HttpGet("my-wishlist")]
    public async Task<ActionResult<WishlistDto>> GetMyWishlist()
    {
        var userId = GetUserId();
        var w = await GetOrCreateDefaultWishlist(userId, saveNow: true);
        var dto = await _db.Wishlists
            .AsNoTracking()
            .Where(x => x.Id == w.Id && !x.IsDeleted)
            .Select(x => new WishlistDto(
                x.Id,
                x.UserId,
                x.Name,
                x.IsDefault,
                x.Items
                    .Where(i => !i.IsDeleted)
                    .OrderByDescending(i => i.CreatedAtUtc)
                    .Select(i => new WishlistItemDto(
                        i.Id,
                        i.ProductId,
                        i.Product.Title,
                        i.Product.Slug,
                        i.Product.ProductMedia
                            .OrderByDescending(m => m.IsPrimary)
                            .ThenBy(m => m.SortOrder)
                            .Select(m => m.Url)
                            .FirstOrDefault(),
                        i.VendorOfferId,
                        i.VendorOfferId != null
                            ? (i.VendorOffer!.DiscountPrice ?? i.VendorOffer!.Price)
                            : i.Product.VendorOffers
                                .Where(vo => !vo.IsDeleted && vo.Status == VendorOfferStatus.Approved)
                                .OrderBy(vo => vo.DiscountPrice ?? vo.Price)
                                .Select(vo => (decimal?)(vo.DiscountPrice ?? vo.Price))
                                .FirstOrDefault()
                    ))
                    .ToList(),
                x.CreatedAtUtc
            ))
            .FirstAsync();

        return Ok(dto);
    }


    [HttpGet("my-wishlist/contains/{productId:guid}")]
    public async Task<ActionResult<WishlistContainsDto>> Contains(Guid productId, [FromQuery] Guid? vendorOfferId = null)
    {
        var userId = GetUserId();

        var isIn = await _db.WishlistItems
            .AsNoTracking()
            .Where(i =>
                !i.IsDeleted &&
                i.ProductId == productId &&
                i.VendorOfferId == vendorOfferId &&
                !i.Wishlist.IsDeleted &&
                i.Wishlist.IsDefault &&
                i.Wishlist.UserId == userId)
            .AnyAsync();

        return Ok(new WishlistContainsDto(isIn));
    }


    [HttpPost("my-wishlist/toggle")]
    public async Task<ActionResult<WishlistToggleResultDto>> Toggle([FromBody] ToggleWishlistDto dto)
    {
        var userId = GetUserId();
        var now = DateTime.UtcNow;
        var strategy = _db.Database.CreateExecutionStrategy();

        WishlistToggleResultDto? result = null;

        await strategy.ExecuteAsync(async () =>
        {
            // wishlist را اگر نبود بساز اما SaveChanges نزن (همه چیز با یک SaveChanges)
            var w = await GetOrCreateDefaultWishlist(userId, saveNow: false);

            var item = await _db.WishlistItems
                .FirstOrDefaultAsync(i =>
                    i.WishlistId == w.Id &&
                    i.ProductId == dto.ProductId &&
                    i.VendorOfferId == dto.VendorOfferId);

            bool isInWishlist;

            if (item == null)
            {
                item = new WishlistItem
                {
                    WishlistId = w.Id,
                    ProductId = dto.ProductId,
                    VendorOfferId = dto.VendorOfferId,
                    CreatedAtUtc = now,
                    UpdatedAtUtc = now,
                    IsDeleted = false,
                };

                _db.WishlistItems.Add(item);
                isInWishlist = true;
            }
            else if (!item.IsDeleted)
            {
                item.IsDeleted = true;
                item.DeletedAtUtc = now;
                item.UpdatedAtUtc = now;
                isInWishlist = false;
            }
            else
            {
                item.IsDeleted = false;
                item.DeletedAtUtc = null;
                item.UpdatedAtUtc = now;
                isInWishlist = true;
            }

            w.UpdatedAtUtc = now;

            // یک SaveChanges => implicit transaction => اتمیک
            await _db.SaveChangesAsync();

            result = new WishlistToggleResultDto(isInWishlist);
        });

        return Ok(result!);
    }
}