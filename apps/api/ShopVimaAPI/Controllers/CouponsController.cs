using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Coupon;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Domain.Enums;
using ShopVima.Infrastructure.Persistence;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/coupons")]
public class CouponsController : ControllerBase
{
    private readonly ShopDbContext _db;
    public CouponsController(ShopDbContext db) => _db = db;

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PagedResult<CouponDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null,
        [FromQuery] string? status = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.Coupons
            .AsNoTracking()
            .Where(c => !c.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(c => c.Code.Contains(s) || c.Title.Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (status == "active")
                query = query.Where(c => c.IsActive && 
                    (c.ValidFrom == null || c.ValidFrom <= DateTime.UtcNow) &&
                    (c.ValidTo == null || c.ValidTo >= DateTime.UtcNow));
            else if (status == "inactive")
                query = query.Where(c => !c.IsActive || 
                    (c.ValidTo != null && c.ValidTo < DateTime.UtcNow));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(c => c.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CouponDto(
                c.Id,
                c.Code,
                c.Title,
                c.Description,
                c.Type,
                c.Value,
                c.MinPurchaseAmount,
                c.MaxDiscountAmount,
                c.MaxUsageCount,
                c.UsedCount,
                c.MaxUsagePerUser,
                c.ValidFrom,
                c.ValidTo,
                c.IsActive,
                c.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(new PagedResult<CouponDto>(items, total, page, pageSize));
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CouponDto>> Get(Guid id)
    {
        var coupon = await _db.Coupons
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);

        if (coupon == null) return NotFound();

        return Ok(new CouponDto(
            coupon.Id,
            coupon.Code,
            coupon.Title,
            coupon.Description,
            coupon.Type,
            coupon.Value,
            coupon.MinPurchaseAmount,
            coupon.MaxDiscountAmount,
            coupon.MaxUsageCount,
            coupon.UsedCount,
            coupon.MaxUsagePerUser,
            coupon.ValidFrom,
            coupon.ValidTo,
            coupon.IsActive,
            coupon.CreatedAtUtc
        ));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CouponDto>> Create([FromBody] CouponCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Code))
            return BadRequest("Code is required.");

        var exists = await _db.Coupons
            .IgnoreQueryFilters()
            .AnyAsync(c => c.Code == dto.Code && !c.IsDeleted);

        if (exists) return Conflict("Coupon code already exists.");

        var coupon = new Coupon
        {
            Code = dto.Code,
            Title = dto.Title,
            Description = dto.Description,
            Type = dto.Type,
            Value = dto.Value,
            MinPurchaseAmount = dto.MinPurchaseAmount,
            MaxDiscountAmount = dto.MaxDiscountAmount,
            MaxUsageCount = dto.MaxUsageCount,
            MaxUsagePerUser = dto.MaxUsagePerUser,
            ValidFrom = dto.ValidFrom,
            ValidTo = dto.ValidTo,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.Coupons.Add(coupon);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = coupon.Id }, new CouponDto(
            coupon.Id,
            coupon.Code,
            coupon.Title,
            coupon.Description,
            coupon.Type,
            coupon.Value,
            coupon.MinPurchaseAmount,
            coupon.MaxDiscountAmount,
            coupon.MaxUsageCount,
            coupon.UsedCount,
            coupon.MaxUsagePerUser,
            coupon.ValidFrom,
            coupon.ValidTo,
            coupon.IsActive,
            coupon.CreatedAtUtc
        ));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CouponCreateDto dto)
    {
        var coupon = await _db.Coupons.FirstOrDefaultAsync(c => c.Id == id);
        if (coupon == null) return NotFound();

        coupon.Code = dto.Code;
        coupon.Title = dto.Title;
        coupon.Description = dto.Description;
        coupon.Type = dto.Type;
        coupon.Value = dto.Value;
        coupon.MinPurchaseAmount = dto.MinPurchaseAmount;
        coupon.MaxDiscountAmount = dto.MaxDiscountAmount;
        coupon.MaxUsageCount = dto.MaxUsageCount;
        coupon.MaxUsagePerUser = dto.MaxUsagePerUser;
        coupon.ValidFrom = dto.ValidFrom;
        coupon.ValidTo = dto.ValidTo;
        coupon.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var coupon = await _db.Coupons.FirstOrDefaultAsync(c => c.Id == id);
        if (coupon == null) return NotFound();

        coupon.IsDeleted = true;
        coupon.DeletedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("trash")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PagedResult<CouponDto>>> Trash(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.Coupons
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(c => c.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(c => c.Code.Contains(s) || c.Title.Contains(s));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(c => c.DeletedAtUtc ?? c.UpdatedAtUtc ?? c.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CouponDto(
                c.Id,
                c.Code,
                c.Title,
                c.Description,
                c.Type,
                c.Value,
                c.MinPurchaseAmount,
                c.MaxDiscountAmount,
                c.MaxUsageCount,
                c.UsedCount,
                c.MaxUsagePerUser,
                c.ValidFrom,
                c.ValidTo,
                c.IsActive,
                c.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(new PagedResult<CouponDto>(items, total, page, pageSize));
    }

    [HttpPost("{id:guid}/restore")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Restore(Guid id)
    {
        var coupon = await _db.Coupons
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.Id == id);

        if (coupon == null) return NotFound();
        if (!coupon.IsDeleted) return BadRequest("این کوپن حذف نشده است");

        coupon.IsDeleted = false;
        coupon.DeletedAtUtc = null;
        coupon.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}/hard")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> HardDelete(Guid id)
    {
        var coupon = await _db.Coupons
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.Id == id);

        if (coupon == null) return NotFound();

        _db.Coupons.Remove(coupon);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("validate")]
    public async Task<ActionResult<CouponValidationResultDto>> Validate([FromBody] CouponValidateDto dto)
    {
        var coupon = await _db.Coupons
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Code == dto.Code && !c.IsDeleted);

        if (coupon == null)
            return Ok(new CouponValidationResultDto(false, "کد کوپن معتبر نیست", 0, null));

        if (!coupon.IsActive)
            return Ok(new CouponValidationResultDto(false, "این کوپن غیرفعال است", 0, null));

        if (coupon.ValidFrom.HasValue && coupon.ValidFrom > DateTime.UtcNow)
            return Ok(new CouponValidationResultDto(false, "این کوپن هنوز فعال نشده است", 0, null));

        if (coupon.ValidTo.HasValue && coupon.ValidTo < DateTime.UtcNow)
            return Ok(new CouponValidationResultDto(false, "این کوپن منقضی شده است", 0, null));

        if (coupon.MaxUsageCount.HasValue && coupon.UsedCount >= coupon.MaxUsageCount.Value)
            return Ok(new CouponValidationResultDto(false, "این کوپن به حداکثر استفاده رسیده است", 0, null));

        if (dto.CartTotal > 0 && coupon.MinPurchaseAmount.HasValue &&
            dto.CartTotal < coupon.MinPurchaseAmount.Value)
            return Ok(new CouponValidationResultDto(false, 
                $"حداقل مبلغ خرید برای این کوپن {coupon.MinPurchaseAmount.Value} تومان است", 
                0, null));

        decimal discountAmount = 0;
        if (dto.CartTotal > 0)
        {
            if (coupon.Type == CouponType.Percentage)
            {
                discountAmount = dto.CartTotal * coupon.Value / 100;
                if (coupon.MaxDiscountAmount.HasValue && discountAmount > coupon.MaxDiscountAmount.Value)
                    discountAmount = coupon.MaxDiscountAmount.Value;
            }
            else
            {
                discountAmount = coupon.Value;
            }
        }

        var couponDto = new CouponDto(
            coupon.Id,
            coupon.Code,
            coupon.Title,
            coupon.Description,
            coupon.Type,
            coupon.Value,
            coupon.MinPurchaseAmount,
            coupon.MaxDiscountAmount,
            coupon.MaxUsageCount,
            coupon.UsedCount,
            coupon.MaxUsagePerUser,
            coupon.ValidFrom,
            coupon.ValidTo,
            coupon.IsActive,
            coupon.CreatedAtUtc
        );

        return Ok(new CouponValidationResultDto(true, null, discountAmount, couponDto));
    }
}

