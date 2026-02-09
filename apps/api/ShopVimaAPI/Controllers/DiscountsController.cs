using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Discount;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/discounts")]
[Authorize(Roles = "Admin")]
public class DiscountsController : ControllerBase
{
    private readonly ShopDbContext _db;
    public DiscountsController(ShopDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<PagedResult<DiscountDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null,
        [FromQuery] string? status = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.Discounts
            .AsNoTracking()
            .Where(d => !d.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(d => d.Title.Contains(s) || (d.Description != null && d.Description.Contains(s)));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            var now = DateTime.UtcNow;

            if (status == "active")
                query = query.Where(d =>
                    d.IsActive &&
                    (d.ValidFrom == null || d.ValidFrom <= now) &&
                    (d.ValidTo == null || d.ValidTo >= now));

            else if (status == "inactive")
                query = query.Where(d =>
                    !d.IsActive ||
                    (d.ValidTo != null && d.ValidTo < now));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(d => d.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new DiscountDto(
                d.Id,
                d.Title,
                d.Description,
                d.Type,
                d.Value,
                d.ProductId,
                d.CategoryId,
                d.VendorId,
                d.BrandId,
                d.MinPurchaseAmount,
                d.MaxDiscountAmount,
                d.ValidFrom,
                d.ValidTo,
                d.IsActive,
                d.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(new PagedResult<DiscountDto>(items, total, page, pageSize));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DiscountDto>> Get(Guid id)
    {
        var d = await _db.Discounts.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (d == null) return NotFound();

        return Ok(new DiscountDto(
            d.Id, d.Title, d.Description, d.Type, d.Value,
            d.ProductId, d.CategoryId, d.VendorId, d.BrandId,
            d.MinPurchaseAmount, d.MaxDiscountAmount,
            d.ValidFrom, d.ValidTo, d.IsActive, d.CreatedAtUtc
        ));
    }

    [HttpPost]
    public async Task<ActionResult<DiscountDto>> Create([FromBody] DiscountCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest("Title is required.");
        
        var d = new Discount
        {
            Title = dto.Title,
            Description = dto.Description,
            Type = dto.Type,
            Value = dto.Value,
            ProductId = dto.ProductId,
            CategoryId = dto.CategoryId,
            VendorId = dto.VendorId,
            BrandId = dto.BrandId,
            MinPurchaseAmount = dto.MinPurchaseAmount,
            MaxDiscountAmount = dto.MaxDiscountAmount,
            ValidFrom = dto.ValidFrom,
            ValidTo = dto.ValidTo,
            IsActive = dto.IsActive,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.Discounts.Add(d);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = d.Id }, new DiscountDto(
            d.Id, d.Title, d.Description, d.Type, d.Value,
            d.ProductId, d.CategoryId, d.VendorId, d.BrandId,
            d.MinPurchaseAmount, d.MaxDiscountAmount,
            d.ValidFrom, d.ValidTo, d.IsActive, d.CreatedAtUtc
        ));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] DiscountCreateDto dto)
    {
        var d = await _db.Discounts.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (d == null) return NotFound();

        d.Title = dto.Title;
        d.Description = dto.Description;
        d.Type = dto.Type;
        d.Value = dto.Value;
        d.ProductId = dto.ProductId;
        d.CategoryId = dto.CategoryId;
        d.VendorId = dto.VendorId;
        d.BrandId = dto.BrandId;
        d.MinPurchaseAmount = dto.MinPurchaseAmount;
        d.MaxDiscountAmount = dto.MaxDiscountAmount;
        d.ValidFrom = dto.ValidFrom;
        d.ValidTo = dto.ValidTo;
        d.IsActive = dto.IsActive;
        d.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var d = await _db.Discounts.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (d == null) return NotFound();

        d.IsDeleted = true;
        d.DeletedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("trash")]
    public async Task<ActionResult<PagedResult<DiscountDto>>> Trash(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.Discounts
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(x => x.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(d => d.Title.Contains(s) || (d.Description != null && d.Description.Contains(s)));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(d => d.DeletedAtUtc ?? d.UpdatedAtUtc ?? d.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new DiscountDto(
                d.Id, d.Title, d.Description, d.Type, d.Value,
                d.ProductId, d.CategoryId, d.VendorId, d.BrandId,
                d.MinPurchaseAmount, d.MaxDiscountAmount,
                d.ValidFrom, d.ValidTo, d.IsActive, d.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(new PagedResult<DiscountDto>(items, total, page, pageSize));
    }

    [HttpPost("{id:guid}/restore")]
    public async Task<IActionResult> Restore(Guid id)
    {
        var d = await _db.Discounts.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id);
        if (d == null) return NotFound();
        if (!d.IsDeleted) return BadRequest("این تخفیف حذف نشده است");

        d.IsDeleted = false;
        d.DeletedAtUtc = null;
        d.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}/hard")]
    public async Task<IActionResult> HardDelete(Guid id)
    {
        var d = await _db.Discounts.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id);
        if (d == null) return NotFound();

        _db.Discounts.Remove(d);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}