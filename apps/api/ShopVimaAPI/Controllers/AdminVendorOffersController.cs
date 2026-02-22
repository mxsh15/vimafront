using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.VendorOffer;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Domain.Enums;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;
using System.Security.Claims;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/admin/vendor-offers")]
[RequireMultiVendorEnabled]
[Authorize]
public class AdminVendorOffersController : ControllerBase
{
    private readonly ShopDbContext _db;
    public AdminVendorOffersController(ShopDbContext db) => _db = db;

    Guid GetAdminUserId()
    {
        var s = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (s == null || !Guid.TryParse(s, out var id)) throw new UnauthorizedAccessException();
        return id;
    }

    async Task AddLog(Guid offerId, VendorOfferModerationAction action, string? notes)
    {
        _db.VendorOfferModerationLogs.Add(new VendorOfferModerationLog
        {
            VendorOfferId = offerId,
            AdminUserId = GetAdminUserId(),
            Action = action,
            Notes = notes,
            CreatedAtUtc = DateTime.UtcNow
        });
        await Task.CompletedTask;
    }

    // GET: /api/admin/vendor-offers?status=Pending&page=1&pageSize=20&q=
    [HttpGet]
    [RequirePermission("vendorOffers.view")]
    public async Task<ActionResult<PagedResult<AdminVendorOfferListItemDto>>> List(
        [FromQuery] VendorOfferStatus? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null
    )
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0 || pageSize > 100) pageSize = 20;

        var query = _db.VendorOffers
            .AsNoTracking()
            .Include(o => o.Product)
            .Include(o => o.Vendor)
            .Where(o => !o.IsDeleted);

        if (status.HasValue)
            query = query.Where(o => o.Status == status.Value);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(o =>
                o.Product.Title.Contains(s) ||
                o.Vendor.StoreName.Contains(s) ||
                o.ProductId.ToString().Contains(s) ||
                o.VendorId.ToString().Contains(s));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(o => o.UpdatedAtUtc ?? o.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new AdminVendorOfferListItemDto(
             o.Id,
            o.ProductId,
            o.Product.Title,
            o.VendorId,
            o.Vendor.StoreName,
            o.Price,
            o.DiscountPrice,
            o.IsDefaultForProduct,
            o.Status,

            o.MinOrderQuantity,
            o.MaxOrderQuantity,
            o.QuantityStep,

            o.IsDeleted,
            o.CreatedAtUtc,
            o.UpdatedAtUtc,
            o.DeletedAtUtc,
            Convert.ToBase64String(o.RowVersion)
            ))
            .ToListAsync();

        return Ok(new PagedResult<AdminVendorOfferListItemDto>(items, total, page, pageSize));
    }

    // GET: /api/admin/vendor-offers/{id}
    [HttpGet("{id:guid}")]
    [RequirePermission("vendorOffers.view")]
    public async Task<ActionResult<AdminVendorOfferDetailDto>> Get(Guid id)
    {
        var o = await _db.VendorOffers
            .AsNoTracking()
            .Include(x => x.Product)
            .Include(x => x.Vendor)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (o == null) return NotFound();

        return Ok(new AdminVendorOfferDetailDto(
            o.Id,
            o.ProductId,
            o.Product.Title,
            o.VendorId,
            o.Vendor.StoreName,
            o.Price,
            o.DiscountPrice,
            o.IsDefaultForProduct,
            o.Status,
            o.ManageStock,
            o.StockQuantity,

            o.MinOrderQuantity,
            o.MaxOrderQuantity,
            o.QuantityStep,

            o.IsDeleted,
            o.CreatedAtUtc,
            o.UpdatedAtUtc,
            o.DeletedAtUtc,
            Convert.ToBase64String(o.RowVersion)
        ));
    }

    // POST: /api/admin/vendor-offers/{id}/approve
    [HttpPost("{id:guid}/approve")]
    [RequirePermission("vendorOffers.moderate")]
    public async Task<IActionResult> Approve(Guid id, [FromBody] AdminOfferModerationDto dto)
    {
        var o = await _db.VendorOffers.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (o == null) return NotFound();

        o.Status = VendorOfferStatus.Approved;
        o.UpdatedAtUtc = DateTime.UtcNow;

        await AddLog(o.Id, VendorOfferModerationAction.Approve, dto.Notes);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // POST: /api/admin/vendor-offers/{id}/reject
    [HttpPost("{id:guid}/reject")]
    [RequirePermission("vendorOffers.moderate")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] AdminOfferModerationDto dto)
    {
        var o = await _db.VendorOffers.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (o == null) return NotFound();

        o.Status = VendorOfferStatus.Rejected;
        o.UpdatedAtUtc = DateTime.UtcNow;

        await AddLog(o.Id, VendorOfferModerationAction.Reject, dto.Notes);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // POST: /api/admin/vendor-offers/{id}/disable
    [HttpPost("{id:guid}/disable")]
    [RequirePermission("vendorOffers.moderate")]
    public async Task<IActionResult> Disable(Guid id, [FromBody] AdminOfferModerationDto dto)
    {
        var o = await _db.VendorOffers.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (o == null) return NotFound();

        o.Status = VendorOfferStatus.Disabled;
        o.UpdatedAtUtc = DateTime.UtcNow;

        await AddLog(o.Id, VendorOfferModerationAction.Disable, dto.Notes);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // POST: /api/admin/vendor-offers/{id}/enable (برمی‌گرده Pending تا دوباره بررسی شود)
    [HttpPost("{id:guid}/enable")]
    [RequirePermission("vendorOffers.moderate")]
    public async Task<IActionResult> Enable(Guid id, [FromBody] AdminOfferModerationDto dto)
    {
        var o = await _db.VendorOffers.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (o == null) return NotFound();

        o.Status = VendorOfferStatus.Pending;
        o.UpdatedAtUtc = DateTime.UtcNow;

        await AddLog(o.Id, VendorOfferModerationAction.Enable, dto.Notes);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: /api/admin/vendor-offers/{id} soft delete
    [HttpDelete("{id:guid}")]
    [RequirePermission("vendorOffers.delete")]
    public async Task<IActionResult> SoftDelete(Guid id)
    {
        var o = await _db.VendorOffers.FirstOrDefaultAsync(x => x.Id == id);
        if (o == null) return NotFound();

        o.IsDeleted = true;
        o.DeletedAtUtc = DateTime.UtcNow;
        o.UpdatedAtUtc = DateTime.UtcNow;

        await AddLog(o.Id, VendorOfferModerationAction.SoftDelete, null);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // GET: /api/admin/vendor-offers/trash
    [HttpGet("trash")]
    [RequirePermission("vendorOffers.trash.view")]
    public async Task<ActionResult<PagedResult<AdminVendorOfferListItemDto>>> Trash(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null
    )
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0 || pageSize > 100) pageSize = 20;

        var query = _db.VendorOffers
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Include(o => o.Product)
            .Include(o => o.Vendor)
            .Where(o => o.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(o => o.Product.Title.Contains(s) || o.Vendor.StoreName.Contains(s));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(o => o.DeletedAtUtc ?? o.UpdatedAtUtc ?? o.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new AdminVendorOfferListItemDto(
                o.Id,
                o.ProductId,
                o.Product.Title,
                o.VendorId,
                o.Vendor.StoreName,
                o.Price,
                o.DiscountPrice,
                o.IsDefaultForProduct,
                o.Status,
                o.MinOrderQuantity,
                o.MaxOrderQuantity,
                o.QuantityStep,
                o.IsDeleted,
                o.CreatedAtUtc,
                o.UpdatedAtUtc,
                o.DeletedAtUtc,
                Convert.ToBase64String(o.RowVersion)
            ))
            .ToListAsync();

        return Ok(new PagedResult<AdminVendorOfferListItemDto>(items, total, page, pageSize));
    }

    // POST: /api/admin/vendor-offers/{id}/restore
    [HttpPost("{id:guid}/restore")]
    [RequirePermission("vendorOffers.restore")]
    public async Task<IActionResult> Restore(Guid id)
    {
        var o = await _db.VendorOffers.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id);
        if (o == null) return NotFound();
        if (!o.IsDeleted) return BadRequest("این مورد حذف نشده است.");

        o.IsDeleted = false;
        o.DeletedAtUtc = null;
        o.UpdatedAtUtc = DateTime.UtcNow;

        await AddLog(o.Id, VendorOfferModerationAction.Restore, null);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: /api/admin/vendor-offers/{id}/hard
    [HttpDelete("{id:guid}/hard")]
    [RequirePermission("vendorOffers.hardDelete")]
    public async Task<IActionResult> HardDelete(Guid id)
    {
        var o = await _db.VendorOffers.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id);
        if (o == null) return NotFound();

        await AddLog(o.Id, VendorOfferModerationAction.HardDelete, null);

        _db.VendorOffers.Remove(o);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ---------------------------
    // گزارش اختلاف قیمت‌ها
    // GET: /api/admin/vendor-offers/price-discrepancies?minOffers=2&thresholdPercent=30&onlyApproved=true
    // ---------------------------
    [HttpGet("price-discrepancies")]
    [RequirePermission("vendorOffers.analytics")]
    public async Task<ActionResult<PagedResult<AdminPriceDiscrepancyRowDto>>> PriceDiscrepancies(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] int minOffers = 2,
        [FromQuery] decimal thresholdPercent = 30m,
        [FromQuery] bool onlyApproved = true,
        [FromQuery] string? q = null
    )
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0 || pageSize > 100) pageSize = 20;
        if (minOffers < 2) minOffers = 2;
        if (thresholdPercent < 0) thresholdPercent = 0;

        // 1) base query (فقط فیلدهای لازم)
        var baseQuery = _db.VendorOffers
            .AsNoTracking()
            .Where(o => !o.IsDeleted);

        if (onlyApproved)
            baseQuery = baseQuery.Where(o => o.Status == VendorOfferStatus.Approved);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            baseQuery = baseQuery.Where(o => o.Product.Title.Contains(s));
        }

        var flat = baseQuery.Select(o => new
        {
            o.ProductId,
            ProductTitle = o.Product.Title,
            o.Id,
            o.VendorId,
            VendorName = o.Vendor.StoreName,
            EffectivePrice = o.DiscountPrice ?? o.Price,
            o.DiscountPrice,
            o.Status
        });

        // 2) فقط Aggregates روی گروه‌ها (قابل ترجمه به SQL)
        var aggregated = flat
            .GroupBy(x => new { x.ProductId, x.ProductTitle })
            .Where(g => g.Count() >= minOffers)
            .Select(g => new
            {
                g.Key.ProductId,
                g.Key.ProductTitle,
                OffersCount = g.Count(),
                MinPrice = g.Min(x => x.EffectivePrice),
                MaxPrice = g.Max(x => x.EffectivePrice),
                AvgPrice = g.Average(x => x.EffectivePrice)
            })
            .Select(x => new
            {
                x.ProductId,
                x.ProductTitle,
                x.OffersCount,
                x.MinPrice,
                x.MaxPrice,
                x.AvgPrice,
                SpreadAmount = x.MaxPrice - x.MinPrice,
                SpreadPercent = x.MinPrice == 0 ? 0 : ((x.MaxPrice - x.MinPrice) / x.MinPrice) * 100m
            })
            .Where(x => x.SpreadPercent >= thresholdPercent);

        var total = await aggregated.CountAsync();

        // 3) صفحه‌بندی ردیف‌ها
        var pageRows = await aggregated
            .OrderByDescending(x => x.SpreadPercent)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var productIds = pageRows.Select(x => x.ProductId).ToList();

        // 4) یک Query جدا برای Offerهای همین صفحه
        var pageOffers = await flat
            .Where(x => productIds.Contains(x.ProductId))
            .ToListAsync();

        var offersByProductId = pageOffers
            .GroupBy(x => x.ProductId)
            .ToDictionary(g => g.Key, g => g
                .Select(o => new AdminPriceDiscrepancyOfferDto(
                    o.Id,
                    o.VendorId,
                    o.VendorName,
                    o.EffectivePrice,
                    o.DiscountPrice,
                    o.Status
                ))
                .ToList()
            );

        // 5) ساخت DTO نهایی در حافظه
        var rows = pageRows.Select(x => new AdminPriceDiscrepancyRowDto(
            x.ProductId,
            x.ProductTitle,
            x.OffersCount,
            x.MinPrice,
            x.MaxPrice,
            x.AvgPrice,
            x.SpreadAmount,
            x.SpreadPercent,
            offersByProductId.TryGetValue(x.ProductId, out var list) ? list : new List<AdminPriceDiscrepancyOfferDto>()
        )).ToList();

        return Ok(new PagedResult<AdminPriceDiscrepancyRowDto>(rows, total, page, pageSize));
    }


    // GET: /api/admin/vendor-offers/{id}/moderation-logs
    [HttpGet("{id:guid}/moderation-logs")]
    [RequirePermission("vendorOffers.view")]
    public async Task<ActionResult<IReadOnlyList<AdminVendorOfferModerationLogDto>>> ModerationLogs(Guid id)
    {
        // اگر Offer وجود نداشت، 404 بده (برای جلوگیری از لو رفتن داده‌های بی‌ربط)
        var exists = await _db.VendorOffers
            .IgnoreQueryFilters()
            .AsNoTracking()
            .AnyAsync(x => x.Id == id);
        if (!exists) return NotFound();

        var logs = await (
            from l in _db.VendorOfferModerationLogs.AsNoTracking()
            where l.VendorOfferId == id
            join u in _db.Users.AsNoTracking() on l.AdminUserId equals u.Id into ug
            from u in ug.DefaultIfEmpty()
            orderby l.CreatedAtUtc descending
            select new AdminVendorOfferModerationLogDto(
                l.Id,
                l.VendorOfferId,
                l.AdminUserId,
                u != null ? u.Email : null,
                u != null ? (u.FirstName + " " + u.LastName) : null,
                l.Action,
                l.Notes,
                l.CreatedAtUtc
            )
        ).ToListAsync();

        return Ok(logs);
    }

}
