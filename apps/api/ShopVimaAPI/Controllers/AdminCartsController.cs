using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Cart;
using ShopVima.Application.Utils;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/admin/carts")]
[Authorize]
public class AdminCartsController : ControllerBase
{
    private readonly ShopDbContext _db;
    public AdminCartsController(ShopDbContext db) => _db = db;

    [HttpGet]
    [RequirePermission("carts.view")]
    public async Task<ActionResult<PagedResult<AdminCartListItemDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.Carts
            .AsNoTracking()
            .Include(c => c.User)
            .Include(c => c.Items)
            .Where(c => !c.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(c =>
                c.User.Email.Contains(s) ||
                c.User.FirstName.Contains(s) ||
                c.User.LastName.Contains(s) ||
                c.Id.ToString().Contains(s)
            );
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(c => c.UpdatedAtUtc ?? c.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new AdminCartListItemDto(
                c.Id,
                c.UserId,
                c.User.FirstName + " " + c.User.LastName,
                c.User.Email,
                c.Items.Sum(i => i.Quantity),
                c.Items.Sum(i => i.UnitPrice * i.Quantity),
                c.CreatedAtUtc,
                c.UpdatedAtUtc,
                c.IsDeleted,
                c.DeletedAtUtc,
                Convert.ToBase64String(c.RowVersion)
            ))
            .ToListAsync();

        return Ok(new PagedResult<AdminCartListItemDto>(items, total, page, pageSize));
    }


    [HttpGet("{id:guid}")]
    [RequirePermission("carts.view")]
    public async Task<ActionResult<AdminCartDetailDto>> Get(Guid id)
    {
        var cart = await _db.Carts
            .AsNoTracking()
            .Include(c => c.User)
            .Include(c => c.Items).ThenInclude(i => i.Product)
            .Include(c => c.Items).ThenInclude(i => i.VendorOffer)
            .Include(c => c.Items).ThenInclude(i => i.ProductVariant)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (cart == null) return NotFound();

        var items = cart.Items.Select(i => new CartItemDto(
            i.Id,
            i.ProductId,
            i.Product.Title,
            i.Product.ProductMedia.FirstOrDefault()!.Url,
            i.VendorOfferId,
            i.ProductVariantId,
            i.Quantity,
            i.UnitPrice,
            i.UnitPrice * i.Quantity
        )).ToList();

        return Ok(new AdminCartDetailDto(
            cart.Id,
            cart.UserId,
            cart.User.FirstName + " " + cart.User.LastName,
            cart.User.Email,
            cart.User.PhoneNumber,
            items,
            items.Sum(x => x.TotalPrice),
            items.Sum(x => x.Quantity),
            cart.CreatedAtUtc,
            cart.UpdatedAtUtc,
            cart.IsDeleted,
            cart.DeletedAtUtc,
            Convert.ToBase64String(cart.RowVersion)
        ));
    }


    [HttpDelete("{id:guid}")]
    [RequirePermission("carts.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var cart = await _db.Carts.FirstOrDefaultAsync(c => c.Id == id);
        if (cart == null) return NotFound();

        cart.IsDeleted = true;
        cart.DeletedAtUtc = DateTime.UtcNow;
        cart.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }


    [HttpGet("trash")]
    [RequirePermission("carts.trash.view")]
    public async Task<ActionResult<PagedResult<AdminCartListItemDto>>> Trash(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.Carts
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Include(c => c.User)
            .Include(c => c.Items)
            .Where(c => c.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(c =>
                c.User.Email.Contains(s) ||
                c.User.FirstName.Contains(s) ||
                c.User.LastName.Contains(s) ||
                c.Id.ToString().Contains(s)
            );
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(c => c.DeletedAtUtc ?? c.UpdatedAtUtc ?? c.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new AdminCartListItemDto(
                c.Id,
                c.UserId,
                c.User.FirstName + " " + c.User.LastName,
                c.User.Email,
                c.Items.Sum(i => i.Quantity),
                c.Items.Sum(i => i.UnitPrice * i.Quantity),
                c.CreatedAtUtc,
                c.UpdatedAtUtc,
                c.IsDeleted,
                c.DeletedAtUtc,
                Convert.ToBase64String(c.RowVersion)
            ))
            .ToListAsync();

        return Ok(new PagedResult<AdminCartListItemDto>(items, total, page, pageSize));
    }


    [HttpPost("{id:guid}/restore")]
    [RequirePermission("carts.restore")]
    public async Task<IActionResult> Restore(Guid id)
    {
        var cart = await _db.Carts.IgnoreQueryFilters().FirstOrDefaultAsync(c => c.Id == id);
        if (cart == null) return NotFound();
        if (!cart.IsDeleted) return BadRequest("این سبد حذف نشده است");

        cart.IsDeleted = false;
        cart.DeletedAtUtc = null;
        cart.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }


    [HttpDelete("{id:guid}/hard")]
    [RequirePermission("carts.hardDelete")]
    public async Task<IActionResult> HardDelete(Guid id)
    {
        var cart = await _db.Carts
            .IgnoreQueryFilters()
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (cart == null) return NotFound();

        _db.CartItems.RemoveRange(cart.Items);
        _db.Carts.Remove(cart);

        await _db.SaveChangesAsync();
        return NoContent();
    }
}
