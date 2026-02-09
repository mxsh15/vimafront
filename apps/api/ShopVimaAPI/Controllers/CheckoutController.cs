using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Checkout;
using ShopVima.Infrastructure.Persistence;
using System.Security.Claims;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/checkout")]
[Authorize]
public class CheckoutController : ControllerBase
{
    private readonly ShopDbContext _db;
    public CheckoutController(ShopDbContext db) => _db = db;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("shipping-options")]
    public async Task<ActionResult<List<ShippingOptionDto>>> GetShippingOptions([FromQuery] Guid addressId)
    {
        var userId = GetUserId();

        var address = await _db.ShippingAddresses
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId && !a.IsDeleted);

        if (address == null) return BadRequest("Invalid address.");

        var cart = await _db.Carts
            .AsNoTracking()
            .Include(c => c.Items)
                .ThenInclude(i => i.VendorOffer)
            .FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted);

        if (cart == null || !cart.Items.Any()) return BadRequest("Cart is empty.");

        // total
        decimal orderAmount = 0;
        foreach (var it in cart.Items)
        {
            var offer = it.VendorOffer;
            if (offer == null) continue;
            var unit = offer.DiscountPrice ?? offer.Price;
            orderAmount += unit * it.Quantity;
        }

        // پیدا کردن Zone مناسب (اولویت: کشور+استان+شهر، سپس کشور+استان، سپس کشور)
        var zones = await _db.ShippingZones
            .AsNoTracking()
            .Include(z => z.Rates)
                .ThenInclude(r => r.ShippingMethod)
            .OrderBy(z => z.SortOrder)
            .ToListAsync();

        bool Matches(ShopVima.Domain.Entities.ShippingZone z)
        {
            if (!string.IsNullOrWhiteSpace(z.CountryCode) && z.CountryCode != "IR") return false; // فعلاً IR
            if (!string.IsNullOrWhiteSpace(z.Province) && z.Province != address.Province) return false;
            if (!string.IsNullOrWhiteSpace(z.City) && z.City != address.City) return false;
            return true;
        }

        var matchedZone = zones.FirstOrDefault(Matches);
        if (matchedZone == null) return Ok(new List<ShippingOptionDto>());

        var options = matchedZone.Rates
            .Where(r => r.ShippingMethod != null && !r.ShippingMethod.IsDeleted)
            .Where(r => !r.MinOrderAmount.HasValue || orderAmount >= r.MinOrderAmount.Value)
            .Select(r =>
            {
                var price = r.Price;
                if (r.FreeShippingMinOrderAmount.HasValue && orderAmount >= r.FreeShippingMinOrderAmount.Value)
                    price = 0;

                return new ShippingOptionDto(
                    ShippingRateId: r.Id,
                    ShippingMethodId: r.ShippingMethodId,
                    ShippingMethodTitle: r.ShippingMethod.Title,
                    Price: price,
                    EtaDaysMin: r.EtaDaysMin,
                    EtaDaysMax: r.EtaDaysMax
                );
            })
            .OrderBy(o => o.Price)
            .ToList();

        return Ok(options);
    }
}
