using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Wishlist;
using ShopVima.Application.Utils;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/admin/wishlists")]
[Authorize]
public class AdminWishlistsController : ControllerBase
{
    private readonly ShopDbContext _db;
    public AdminWishlistsController(ShopDbContext db) => _db = db;

    // GET: /api/admin/wishlists?page=1&pageSize=20&q=
    [HttpGet]
    [RequirePermission("wishlists.view")]
    public async Task<ActionResult<PagedResult<AdminWishlistListItemDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null
    )
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0 || pageSize > 100) pageSize = 20;

        var query = _db.Wishlists
            .AsNoTracking()
            .Include(x => x.User)
            .Include(x => x.Items)
            .Where(x => !x.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(x =>
                (x.Name != null && x.Name.Contains(s)) ||
                x.User.Email.Contains(s) ||
                x.User.FullName.Contains(s) ||
                x.UserId.ToString().Contains(s));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.UpdatedAtUtc ?? x.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new AdminWishlistListItemDto(
                x.Id,
                x.UserId,
                x.User.FullName,
                x.User.Email,
                x.Name,
                x.IsDefault,
                x.Items.Count(i => !i.IsDeleted),
                x.CreatedAtUtc,
                x.UpdatedAtUtc,
                x.IsDeleted,
                x.DeletedAtUtc,
                Convert.ToBase64String(x.RowVersion)
            ))
            .ToListAsync();

        return Ok(new PagedResult<AdminWishlistListItemDto>(items, total, page, pageSize));
    }

    // GET: /api/admin/wishlists/{id}
    [HttpGet("{id:guid}")]
    [RequirePermission("wishlists.view")]
    public async Task<ActionResult<AdminWishlistDetailDto>> Get(Guid id)
    {
        var w = await _db.Wishlists
            .AsNoTracking()
            .Include(x => x.User)
            .Include(x => x.Items).ThenInclude(i => i.Product)
            .Include(x => x.Items).ThenInclude(i => i.VendorOffer).ThenInclude(vo => vo.Vendor)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

        if (w == null) return NotFound();

        var items = w.Items
            .Where(i => !i.IsDeleted)
            .OrderByDescending(i => i.CreatedAtUtc)
            .Select(i => new AdminWishlistItemDto(
                i.Id,
                i.ProductId,
                i.Product.Title,
                i.VendorOfferId,
                i.VendorOffer != null ? i.VendorOffer.Vendor.StoreName : null,
                i.CreatedAtUtc
            ))
            .ToList();

        return Ok(new AdminWishlistDetailDto(
            w.Id,
            w.UserId,
            w.User.FullName,
            w.User.Email,
            w.Name,
            w.IsDefault,
            items,
            w.CreatedAtUtc,
            w.UpdatedAtUtc,
            w.IsDeleted,
            w.DeletedAtUtc,
            Convert.ToBase64String(w.RowVersion)
        ));
    }

    // GET: /api/admin/wishlists/top-products?take=50
    [HttpGet("top-products")]
    [RequirePermission("wishlists.analytics")]
    public async Task<ActionResult<IEnumerable<AdminWishlistTopProductDto>>> TopProducts([FromQuery] int take = 50)
    {
        if (take <= 0 || take > 200) take = 50;

        var rows = await _db.WishlistItems
            .AsNoTracking()
            .Include(i => i.Product)
            .Where(i => !i.IsDeleted && !i.Product.IsDeleted)
            .GroupBy(i => new { i.ProductId, i.Product.Title })
            .OrderByDescending(g => g.Count())
            .Take(take)
            .Select(g => new AdminWishlistTopProductDto(g.Key.ProductId, g.Key.Title, g.Count()))
            .ToListAsync();

        return Ok(rows);
    }

    // DELETE: /api/admin/wishlists/{id} (soft delete)
    [HttpDelete("{id:guid}")]
    [RequirePermission("wishlists.delete")]
    public async Task<IActionResult> SoftDelete(Guid id)
    {
        var w = await _db.Wishlists.FirstOrDefaultAsync(x => x.Id == id);
        if (w == null) return NotFound();

        w.IsDeleted = true;
        w.DeletedAtUtc = DateTime.UtcNow;
        w.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // GET: /api/admin/wishlists/trash
    [HttpGet("trash")]
    [RequirePermission("wishlists.trash.view")]
    public async Task<ActionResult<PagedResult<AdminWishlistListItemDto>>> Trash(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null
    )
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0 || pageSize > 100) pageSize = 20;

        var query = _db.Wishlists
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Include(x => x.User)
            .Include(x => x.Items)
            .Where(x => x.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(x =>
                (x.Name != null && x.Name.Contains(s)) ||
                x.User.Email.Contains(s) ||
                x.User.FullName.Contains(s));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.DeletedAtUtc ?? x.UpdatedAtUtc ?? x.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new AdminWishlistListItemDto(
                x.Id,
                x.UserId,
                x.User.FullName,
                x.User.Email,
                x.Name,
                x.IsDefault,
                x.Items.Count(i => !i.IsDeleted),
                x.CreatedAtUtc,
                x.UpdatedAtUtc,
                x.IsDeleted,
                x.DeletedAtUtc,
                Convert.ToBase64String(x.RowVersion)
            ))
            .ToListAsync();

        return Ok(new PagedResult<AdminWishlistListItemDto>(items, total, page, pageSize));
    }

    // POST: /api/admin/wishlists/{id}/restore
    [HttpPost("{id:guid}/restore")]
    [RequirePermission("wishlists.restore")]
    public async Task<IActionResult> Restore(Guid id)
    {
        var w = await _db.Wishlists.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id);
        if (w == null) return NotFound();
        if (!w.IsDeleted) return BadRequest("این مورد حذف نشده است.");

        w.IsDeleted = false;
        w.DeletedAtUtc = null;
        w.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: /api/admin/wishlists/{id}/hard
    [HttpDelete("{id:guid}/hard")]
    [RequirePermission("wishlists.hardDelete")]
    public async Task<IActionResult> HardDelete(Guid id)
    {
        var w = await _db.Wishlists
            .IgnoreQueryFilters()
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (w == null) return NotFound();

        _db.WishlistItems.RemoveRange(w.Items);
        _db.Wishlists.Remove(w);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
