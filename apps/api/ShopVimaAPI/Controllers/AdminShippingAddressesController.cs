using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.ShippingAddress;
using ShopVima.Application.Utils;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/admin/shipping-addresses")]
[Authorize]
public class AdminShippingAddressesController : ControllerBase
{
    private readonly ShopDbContext _db;
    public AdminShippingAddressesController(ShopDbContext db) => _db = db;


    [HttpGet]
    [RequirePermission("shippingAddresses.view")]
    public async Task<ActionResult<PagedResult<AdminShippingAddressListItemDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null,
        [FromQuery] string? mode = null
    )
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var baseQuery = _db.ShippingAddresses
            .AsNoTracking()
            .Include(a => a.User)
            .Where(a => !a.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            baseQuery = baseQuery.Where(a =>
                a.User.Email.Contains(s) ||
                a.User.FirstName.Contains(s) ||
                a.User.LastName.Contains(s) ||
                a.Title.Contains(s) ||
                a.City.Contains(s) ||
                a.Province.Contains(s) ||
                a.AddressLine.Contains(s) ||
                a.Id.ToString().Contains(s)
            );
        }

        // استفاده در سفارش: مدل شما Order.ShippingAddressId دارد، پس این دقیق است
        var query = baseQuery.Select(a => new
        {
            Address = a,
            UsedInOrders = _db.Orders.Any(o => o.ShippingAddressId == a.Id)
        });

        if (string.Equals(mode, "used", StringComparison.OrdinalIgnoreCase))
            query = query.Where(x => x.UsedInOrders);

        if (string.Equals(mode, "unused", StringComparison.OrdinalIgnoreCase))
            query = query.Where(x => !x.UsedInOrders);

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.Address.UpdatedAtUtc ?? x.Address.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new AdminShippingAddressListItemDto(
                x.Address.Id,
                x.Address.UserId,
                x.Address.User.FirstName + " " + x.Address.User.LastName,
                x.Address.User.Email,
                x.Address.Title,
                x.Address.Province,
                x.Address.City,
                x.Address.AddressLine,
                x.Address.PostalCode,
                x.Address.IsDefault,
                x.UsedInOrders,
                x.Address.CreatedAtUtc,
                x.Address.UpdatedAtUtc,
                x.Address.IsDeleted,
                x.Address.DeletedAtUtc,
                Convert.ToBase64String(x.Address.RowVersion)
            ))
            .ToListAsync();

        return Ok(new PagedResult<AdminShippingAddressListItemDto>(items, total, page, pageSize));
    }


    [HttpGet("abandoned")]
    [RequirePermission("shippingAddresses.view")]
    public async Task<ActionResult<PagedResult<AdminShippingAddressListItemDto>>> Abandoned(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] int days = 30,
        [FromQuery] string? q = null
    )
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var cutoff = DateTime.UtcNow.AddDays(-Math.Max(1, days));

        var baseQuery = _db.ShippingAddresses
            .AsNoTracking()
            .Include(a => a.User)
            .Where(a => !a.IsDeleted)
            .Where(a => (a.UpdatedAtUtc ?? a.CreatedAtUtc) <= cutoff);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            baseQuery = baseQuery.Where(a =>
                a.User.Email.Contains(s) ||
                a.User.FirstName.Contains(s) ||
                a.User.LastName.Contains(s) ||
                a.Title.Contains(s) ||
                a.City.Contains(s) ||
                a.Province.Contains(s) ||
                a.AddressLine.Contains(s) ||
                a.Id.ToString().Contains(s)
            );
        }

        var query = baseQuery.Select(a => new
        {
            Address = a,
            UsedInOrders = _db.Orders.Any(o => o.ShippingAddressId == a.Id)
        }).Where(x => !x.UsedInOrders);

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.Address.UpdatedAtUtc ?? x.Address.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new AdminShippingAddressListItemDto(
                x.Address.Id,
                x.Address.UserId,
                x.Address.User.FirstName + " " + x.Address.User.LastName,
                x.Address.User.Email,
                x.Address.Title,
                x.Address.Province,
                x.Address.City,
                x.Address.AddressLine,
                x.Address.PostalCode,
                x.Address.IsDefault,
                x.UsedInOrders,
                x.Address.CreatedAtUtc,
                x.Address.UpdatedAtUtc,
                x.Address.IsDeleted,
                x.Address.DeletedAtUtc,
                Convert.ToBase64String(x.Address.RowVersion)
            ))
            .ToListAsync();

        return Ok(new PagedResult<AdminShippingAddressListItemDto>(items, total, page, pageSize));
    }



    [HttpGet("{id:guid}")]
    [RequirePermission("shippingAddresses.view")]
    public async Task<ActionResult<AdminShippingAddressDetailDto>> Get(Guid id)
    {
        var address = await _db.ShippingAddresses
            .AsNoTracking()
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (address == null) return NotFound();

        var used = await _db.Orders.AnyAsync(o => o.ShippingAddressId == address.Id);

        return Ok(new AdminShippingAddressDetailDto(
            address.Id,
            address.UserId,
            address.User.FirstName + " " + address.User.LastName,
            address.User.Email,
            address.User.PhoneNumber,
            address.Title,
            address.Province,
            address.City,
            address.AddressLine,
            address.PostalCode,
            address.IsDefault,
            used,
            address.CreatedAtUtc,
            address.UpdatedAtUtc,
            address.IsDeleted,
            address.DeletedAtUtc,
            Convert.ToBase64String(address.RowVersion)
        ));
    }



    [HttpDelete("{id:guid}")]
    [RequirePermission("shippingAddresses.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var address = await _db.ShippingAddresses.FirstOrDefaultAsync(a => a.Id == id);
        if (address == null) return NotFound();

        address.IsDeleted = true;
        address.DeletedAtUtc = DateTime.UtcNow;
        address.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }



    [HttpGet("trash")]
    [RequirePermission("shippingAddresses.trash.view")]
    public async Task<ActionResult<PagedResult<AdminShippingAddressListItemDto>>> Trash(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null
    )
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var baseQuery = _db.ShippingAddresses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Include(a => a.User)
            .Where(a => a.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            baseQuery = baseQuery.Where(a =>
                a.User.Email.Contains(s) ||
                a.User.FirstName.Contains(s) ||
                a.User.LastName.Contains(s) ||
                a.Title.Contains(s) ||
                a.City.Contains(s) ||
                a.Province.Contains(s) ||
                a.AddressLine.Contains(s) ||
                a.Id.ToString().Contains(s)
            );
        }

        var query = baseQuery.Select(a => new
        {
            Address = a,
            UsedInOrders = _db.Orders.Any(o => o.ShippingAddressId == a.Id)
        });

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.Address.DeletedAtUtc ?? x.Address.UpdatedAtUtc ?? x.Address.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new AdminShippingAddressListItemDto(
                x.Address.Id,
                x.Address.UserId,
                x.Address.User.FirstName + " " + x.Address.User.LastName,
                x.Address.User.Email,
                x.Address.Title,
                x.Address.Province,
                x.Address.City,
                x.Address.AddressLine,
                x.Address.PostalCode,
                x.Address.IsDefault,
                x.UsedInOrders,
                x.Address.CreatedAtUtc,
                x.Address.UpdatedAtUtc,
                x.Address.IsDeleted,
                x.Address.DeletedAtUtc,
                Convert.ToBase64String(x.Address.RowVersion)
            ))
            .ToListAsync();

        return Ok(new PagedResult<AdminShippingAddressListItemDto>(items, total, page, pageSize));
    }



    [HttpPost("{id:guid}/restore")]
    [RequirePermission("shippingAddresses.restore")]
    public async Task<IActionResult> Restore(Guid id)
    {
        var address = await _db.ShippingAddresses.IgnoreQueryFilters().FirstOrDefaultAsync(a => a.Id == id);
        if (address == null) return NotFound();
        if (!address.IsDeleted) return BadRequest("این آدرس حذف نشده است");

        address.IsDeleted = false;
        address.DeletedAtUtc = null;
        address.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }



    [HttpDelete("{id:guid}/hard")]
    [RequirePermission("shippingAddresses.hardDelete")]
    public async Task<IActionResult> HardDelete(Guid id)
    {
        var address = await _db.ShippingAddresses.IgnoreQueryFilters().FirstOrDefaultAsync(a => a.Id == id);
        if (address == null) return NotFound();

        _db.ShippingAddresses.Remove(address);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}