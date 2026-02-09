using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.ShippingMethods;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;
using ShopVimaAPI.Utils;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/admin/shipping-methods")]
[Authorize]
public class AdminShippingMethodsController : ControllerBase
{
    private readonly ShopDbContext _db;
    public AdminShippingMethodsController(ShopDbContext db) => _db = db;

    [HttpGet]
    [RequirePermission("shippingMethods.view")]
    public async Task<ActionResult<PagedResult<AdminShippingMethodListItemDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.ShippingMethods.AsNoTracking().Where(x => !x.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(x => x.Title.Contains(s) || x.Code.Contains(s));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(x => x.SortOrder).ThenByDescending(x => x.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new AdminShippingMethodListItemDto(
                x.Id, x.Title, x.Code, x.Status, x.SortOrder, x.DefaultPrice, x.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(new PagedResult<AdminShippingMethodListItemDto>(items, total, page, pageSize));
    }

    [HttpPost]
    [RequirePermission("shippingMethods.create")]
    public async Task<ActionResult> Create([FromBody] AdminShippingMethodUpsertDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title)) return BadRequest("Title is required");

        var baseCode = CodeGenerator.ToCode(dto.Code ?? dto.Title);
        var code = baseCode;

        var tries = 0;
        while (await _db.ShippingMethods.AnyAsync(x => x.Code == code && !x.IsDeleted))
        {
            tries++;
            code = $"{baseCode}-{CodeGenerator.ShortToken(5)}";
            if (tries > 20) return StatusCode(500, "Could not generate unique code");
        }

        var m = new ShippingMethod
        {
            Title = dto.Title.Trim(),
            Code = code,
            Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
            Status = dto.Status,
            SortOrder = dto.SortOrder,
            DefaultPrice = dto.DefaultPrice,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.ShippingMethods.Add(m);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("shippingMethods.update")]
    public async Task<IActionResult> Update(Guid id, [FromBody] AdminShippingMethodUpsertDto dto)
    {
        var m = await _db.ShippingMethods.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (m == null) return NotFound();

        m.Title = dto.Title.Trim();
        m.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();
        m.Status = dto.Status;
        m.SortOrder = dto.SortOrder;
        m.DefaultPrice = dto.DefaultPrice;
        m.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }


    [HttpDelete("{id:guid}")]
    [RequirePermission("shippingMethods.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var m = await _db.ShippingMethods.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (m == null) return NotFound();

        m.IsDeleted = true;
        m.DeletedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("trash")]
    [RequirePermission("shippingMethods.trash.view")]
    public async Task<ActionResult<PagedResult<AdminShippingMethodListItemDto>>> Trash(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.ShippingMethods.IgnoreQueryFilters().AsNoTracking().Where(x => x.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(x => x.Title.Contains(s) || x.Code.Contains(s));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(x => x.DeletedAtUtc ?? x.UpdatedAtUtc ?? x.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new AdminShippingMethodListItemDto(
                x.Id, x.Title, x.Code, x.Status, x.SortOrder, x.DefaultPrice, x.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(new PagedResult<AdminShippingMethodListItemDto>(items, total, page, pageSize));
    }

    [HttpPost("{id:guid}/restore")]
    [RequirePermission("shippingMethods.restore")]
    public async Task<IActionResult> Restore(Guid id)
    {
        var m = await _db.ShippingMethods.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id);
        if (m == null) return NotFound();
        if (!m.IsDeleted) return BadRequest("این مورد حذف نشده است");

        m.IsDeleted = false;
        m.DeletedAtUtc = null;
        m.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}/hard")]
    [RequirePermission("shippingMethods.hardDelete")]
    public async Task<IActionResult> HardDelete(Guid id)
    {
        var m = await _db.ShippingMethods.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id);
        if (m == null) return NotFound();

        _db.ShippingMethods.Remove(m);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
