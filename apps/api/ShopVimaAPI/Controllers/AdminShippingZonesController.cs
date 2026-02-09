using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.ShippingZones;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/admin/shipping-zones")]
[Authorize]
public class AdminShippingZonesController : ControllerBase
{
    private readonly ShopDbContext _db;
    public AdminShippingZonesController(ShopDbContext db) => _db = db;

    [HttpGet]
    [RequirePermission("shippingZones.view")]
    public async Task<ActionResult<PagedResult<AdminShippingZoneListItemDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.ShippingZones.AsNoTracking().Where(x => !x.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(x => x.Title.Contains(s) || (x.City != null && x.City.Contains(s)) || (x.Province != null && x.Province.Contains(s)));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(x => x.SortOrder).ThenByDescending(x => x.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new AdminShippingZoneListItemDto(
                x.Id, x.Title, x.Status, x.SortOrder, x.CountryCode, x.Province, x.City, x.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(new PagedResult<AdminShippingZoneListItemDto>(items, total, page, pageSize));
    }

    [HttpPost]
    [RequirePermission("shippingZones.create")]
    public async Task<ActionResult> Create([FromBody] AdminShippingZoneUpsertDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title)) return BadRequest("Title is required");

        var z = new ShippingZone
        {
            Title = dto.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
            Status = dto.Status,
            SortOrder = dto.SortOrder,
            CountryCode = string.IsNullOrWhiteSpace(dto.CountryCode) ? null : dto.CountryCode.Trim().ToUpperInvariant(),
            Province = string.IsNullOrWhiteSpace(dto.Province) ? null : dto.Province.Trim(),
            City = string.IsNullOrWhiteSpace(dto.City) ? null : dto.City.Trim(),
            PostalCodePattern = string.IsNullOrWhiteSpace(dto.PostalCodePattern) ? null : dto.PostalCodePattern.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.ShippingZones.Add(z);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("shippingZones.update")]
    public async Task<IActionResult> Update(Guid id, [FromBody] AdminShippingZoneUpsertDto dto)
    {
        var z = await _db.ShippingZones.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (z == null) return NotFound();

        z.Title = dto.Title.Trim();
        z.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();
        z.Status = dto.Status;
        z.SortOrder = dto.SortOrder;
        z.CountryCode = string.IsNullOrWhiteSpace(dto.CountryCode) ? null : dto.CountryCode.Trim().ToUpperInvariant();
        z.Province = string.IsNullOrWhiteSpace(dto.Province) ? null : dto.Province.Trim();
        z.City = string.IsNullOrWhiteSpace(dto.City) ? null : dto.City.Trim();
        z.PostalCodePattern = string.IsNullOrWhiteSpace(dto.PostalCodePattern) ? null : dto.PostalCodePattern.Trim();
        z.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("shippingZones.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var z = await _db.ShippingZones.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (z == null) return NotFound();

        z.IsDeleted = true;
        z.DeletedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // نرخ‌ها: Upsert list برای Zone
    [HttpGet("{id:guid}/rates")]
    [RequirePermission("shippingZones.rates.view")]
    public async Task<ActionResult<List<AdminShippingZoneRateDto>>> GetRates(Guid id)
    {
        var zExists = await _db.ShippingZones.AsNoTracking().AnyAsync(x => x.Id == id && !x.IsDeleted);
        if (!zExists) return NotFound();

        var rates = await _db.ShippingZoneRates
            .AsNoTracking()
            .Where(r => r.ShippingZoneId == id && !r.IsDeleted)
            .Select(r => new AdminShippingZoneRateDto(
                r.ShippingMethodId, r.Price, r.MinOrderAmount, r.FreeShippingMinOrderAmount, r.EtaDaysMin, r.EtaDaysMax
            ))
            .ToListAsync();

        return Ok(rates);
    }

    [HttpPut("{id:guid}/rates")]
    [RequirePermission("shippingZones.rates.update")]
    public async Task<IActionResult> UpsertRates(Guid id, [FromBody] List<AdminShippingZoneRateDto> rates)
    {
        var z = await _db.ShippingZones.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (z == null) return NotFound();

        var methodIds = rates.Select(x => x.ShippingMethodId).Distinct().ToList();
        var methods = await _db.ShippingMethods.AsNoTracking().Where(m => methodIds.Contains(m.Id) && !m.IsDeleted).Select(m => m.Id).ToListAsync();
        if (methods.Count != methodIds.Count) return BadRequest("برخی روش‌های ارسال معتبر نیستند.");

        var existing = await _db.ShippingZoneRates
            .Where(r => r.ShippingZoneId == id && !r.IsDeleted)
            .ToListAsync();

        foreach (var dto in rates)
        {
            var ex = existing.FirstOrDefault(x => x.ShippingMethodId == dto.ShippingMethodId);
            if (ex == null)
            {
                _db.ShippingZoneRates.Add(new ShippingZoneRate
                {
                    ShippingZoneId = id,
                    ShippingMethodId = dto.ShippingMethodId,
                    Price = dto.Price,
                    MinOrderAmount = dto.MinOrderAmount,
                    FreeShippingMinOrderAmount = dto.FreeShippingMinOrderAmount,
                    EtaDaysMin = dto.EtaDaysMin,
                    EtaDaysMax = dto.EtaDaysMax,
                    CreatedAtUtc = DateTime.UtcNow
                });
            }
            else
            {
                ex.Price = dto.Price;
                ex.MinOrderAmount = dto.MinOrderAmount;
                ex.FreeShippingMinOrderAmount = dto.FreeShippingMinOrderAmount;
                ex.EtaDaysMin = dto.EtaDaysMin;
                ex.EtaDaysMax = dto.EtaDaysMax;
                ex.UpdatedAtUtc = DateTime.UtcNow;
            }
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }
}
