using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Cart;
using ShopVima.Domain.Entities;
using ShopVima.Domain.Enums;
using ShopVima.Infrastructure.Persistence;
using System.Security.Claims;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/carts")]
[Authorize]
public class CartsController : ControllerBase
{
    private readonly ShopDbContext _db;
    public CartsController(ShopDbContext db) => _db = db;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("my-cart")]
    public async Task<ActionResult<CartDto>> GetMyCart()
    {
        var userId = GetUserId();
        var cart = await _db.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
            .Include(c => c.Items)
                .ThenInclude(i => i.VendorOffer)
            .Include(c => c.Items)
                .ThenInclude(i => i.ProductVariant)
            .FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted);

        if (cart == null)
        {
            cart = new Cart
            {
                UserId = userId,
                CreatedAtUtc = DateTime.UtcNow
            };
            _db.Carts.Add(cart);
            await _db.SaveChangesAsync();
        }

        var items = cart.Items.Select(i => new CartItemDto(
            i.Id,
            i.ProductId,
            i.Product.Title,
            i.Product.ProductMedia.FirstOrDefault()?.Url,
            i.VendorOfferId,
            i.ProductVariantId,
            i.Quantity,
            i.UnitPrice,
            i.TotalPrice
        )).ToList();

        return Ok(new CartDto(
            cart.Id,
            cart.UserId,
            items,
            cart.TotalPrice,
            cart.TotalItems,
            cart.CreatedAtUtc
        ));
    }

    [HttpPost("items")]
    public async Task<ActionResult> AddToCart([FromBody] AddToCartDto dto)
    {
        var userId = GetUserId();
        var qty = dto.Quantity <= 0 ? 1 : dto.Quantity;

        // 1) offer معتبر
        var offer = await _db.VendorOffers
            .AsNoTracking()
            .FirstOrDefaultAsync(o =>
                o.Id == dto.VendorOfferId &&
                !o.IsDeleted &&
                o.Status == VendorOfferStatus.Approved);

        if (offer == null) return BadRequest("Invalid vendor offer");

        var unitPrice = offer.DiscountPrice ?? offer.Price;
        var productId = offer.ProductId;

        // 2) cart بگیر/بساز (اینجا safe تر: یک بار)
        var cart = await _db.Carts.FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted);
        if (cart == null)
        {
            cart = new Cart { UserId = userId, CreatedAtUtc = DateTime.UtcNow };
            _db.Carts.Add(cart);
            await _db.SaveChangesAsync(); // فقط برای گرفتن cart.Id
        }

        // 3) اول تلاش کن آیتم موجود را اتمیک آپدیت کنی
        var affected = await _db.CartItems
            .Where(i =>
                i.CartId == cart.Id &&
                !i.IsDeleted &&
                i.VendorOfferId == dto.VendorOfferId &&
                i.ProductVariantId == dto.ProductVariantId)
            .ExecuteUpdateAsync(s => s
                .SetProperty(i => i.Quantity, i => i.Quantity + qty)
                .SetProperty(i => i.UnitPrice, i => unitPrice)
                .SetProperty(i => i.UpdatedAtUtc, i => DateTime.UtcNow)
            );

        if (affected > 0)
            return Ok();

        // 4) اگر آیتم نبود، INSERT کن
        _db.CartItems.Add(new CartItem
        {
            CartId = cart.Id,
            ProductId = productId,
            VendorOfferId = dto.VendorOfferId,
            ProductVariantId = dto.ProductVariantId,
            Quantity = qty,
            UnitPrice = unitPrice,
            CreatedAtUtc = DateTime.UtcNow
        });

        try
        {
            await _db.SaveChangesAsync();
            return Ok();
        }
        catch (DbUpdateException)
        {
            await _db.CartItems
                .Where(i =>
                    i.CartId == cart.Id &&
                    !i.IsDeleted &&
                    i.VendorOfferId == dto.VendorOfferId &&
                    i.ProductVariantId == dto.ProductVariantId)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(i => i.Quantity, i => i.Quantity + qty)
                    .SetProperty(i => i.UnitPrice, i => unitPrice)
                    .SetProperty(i => i.UpdatedAtUtc, i => DateTime.UtcNow)
                );

            return Ok();
        }

        //var userId = GetUserId();
        //var cart = await _db.Carts
        //    .Include(c => c.Items)
        //    .FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted);

        //if (cart == null)
        //{
        //    cart = new Cart { UserId = userId, CreatedAtUtc = DateTime.UtcNow };
        //    _db.Carts.Add(cart);
        //    await _db.SaveChangesAsync();
        //}

        //var offer = await _db.VendorOffers
        //    .FirstOrDefaultAsync(o => o.Id == dto.VendorOfferId && o.Status == VendorOfferStatus.Approved);

        //if (offer == null) return BadRequest("Invalid vendor offer");

        //var existingItem = cart.Items.FirstOrDefault(i =>
        //    i.ProductId == dto.ProductId &&
        //    i.VendorOfferId == dto.VendorOfferId &&
        //    i.ProductVariantId == dto.ProductVariantId);

        //if (existingItem != null)
        //{
        //    existingItem.Quantity += dto.Quantity;
        //    existingItem.UnitPrice = offer.Price;
        //}
        //else
        //{
        //    cart.Items.Add(new CartItem
        //    {
        //        ProductId = dto.ProductId,
        //        VendorOfferId = dto.VendorOfferId,
        //        ProductVariantId = dto.ProductVariantId,
        //        Quantity = dto.Quantity,
        //        UnitPrice = offer.Price,
        //        CreatedAtUtc = DateTime.UtcNow
        //    });
        //}

        //await _db.SaveChangesAsync();
        //return Ok();
    }

    [HttpPut("items/{id:guid}")]
    public async Task<ActionResult> UpdateCartItem(Guid id, [FromBody] UpdateCartItemDto dto)
    {
        var userId = GetUserId();
        var item = await _db.CartItems
            .Include(i => i.Cart)
            .FirstOrDefaultAsync(i => i.Id == id && i.Cart.UserId == userId);

        if (item == null) return NotFound();

        item.Quantity = dto.Quantity;
        item.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok();
    }

    [HttpDelete("items/{id:guid}")]
    public async Task<ActionResult> RemoveFromCart(Guid id)
    {
        var userId = GetUserId();
        var item = await _db.CartItems
            .Include(i => i.Cart)
            .FirstOrDefaultAsync(i => i.Id == id && i.Cart.UserId == userId);

        if (item == null) return NotFound();

        _db.CartItems.Remove(item);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("clear")]
    public async Task<ActionResult> ClearCart()
    {
        var userId = GetUserId();
        var cart = await _db.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted);

        if (cart == null) return NotFound();

        _db.CartItems.RemoveRange(cart.Items);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}

